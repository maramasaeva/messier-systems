import SpotifyWebApi from 'spotify-web-api-js';

// Hard-code the client ID for development to ensure it's always available
const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '8c6c0ff17bee46ea9aec45c4d095cfcb';
const redirectUri = 'http://127.0.0.1:3000/callback'; // Make sure this matches your Spotify app settings

const scopes = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
  'app-remote-control',
];

export const spotifyApi = new SpotifyWebApi();

// Generate a code verifier and challenge for PKCE
function generateCodeVerifier(length: number): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return text;
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Get the Spotify login URL using Authorization Code Flow with PKCE
export const getSpotifyLoginUrl = async () => {
  console.log('Using client ID:', clientId);
  console.log('Using redirect URI:', redirectUri);
  
  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store the code verifier in localStorage to use during token exchange
  localStorage.setItem('spotify_code_verifier', codeVerifier);
  
  // Generate state for CSRF protection
  const state = generateRandomString(16);
  localStorage.setItem('spotify_auth_state', state);
  
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    show_dialog: 'true',
    state: state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });
  
  const url = `https://accounts.spotify.com/authorize?${params.toString()}`;
  console.log('Authorization URL:', url);
  return url;
};

// Helper function to generate a random string for the state parameter
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return text;
}

// Exchange code for access token using Authorization Code Flow with PKCE
export const getAccessToken = async (code: string): Promise<string | null> => {
  try {
    // In a real production app, this would be done server-side to keep client_secret secure
    // For this demo, we'll use a proxy endpoint to exchange the code for a token
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    
    // Get the code verifier from localStorage that was stored during authorization request
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    
    if (!codeVerifier) {
      console.error('No code verifier found in localStorage');
      return null;
    }
    
    console.log('Exchanging code for token with code verifier');
    
    const payload = new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    });
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: payload.toString()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token exchange error:', errorData);
      return null;
    }
    
    const data = await response.json();
    const accessToken = data.access_token;
    
    if (accessToken) {
      console.log('Successfully obtained access token');
      
      // Set the token for the Spotify API
      spotifyApi.setAccessToken(accessToken);
      
      // Store token expiration time
      const expiresIn = data.expires_in || 3600;
      const expirationTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem('spotify_token_expiration', expirationTime.toString());
      localStorage.setItem('spotify_access_token', accessToken);
      
      return accessToken;
    }
    
    return null;
  } catch (err) {
    console.error('Error exchanging code for token:', err);
    return null;
  }
};

// Handle the callback with code parameter
export const handleCallback = async (urlSearchParams: URLSearchParams): Promise<string | null> => {
  try {
    const code = urlSearchParams.get('code');
    const error = urlSearchParams.get('error');
    const state = urlSearchParams.get('state');
    const storedState = localStorage.getItem('spotify_auth_state');
    
    console.log('Handling callback with code:', code ? code.substring(0, 10) + '...' : 'null');
    
    // Clear the stored state
    localStorage.removeItem('spotify_auth_state');
    
    // Verify state to prevent CSRF attacks
    if (state === null || state !== storedState) {
      console.error('State mismatch - possible CSRF attack');
      console.error('Received state:', state);
      console.error('Stored state:', storedState);
      return null;
    }
    
    if (error) {
      console.error('Spotify authentication error:', error);
      return null;
    }
    
    if (code) {
      // Exchange the code for an access token using PKCE
      return await getAccessToken(code);
    }
    
    return null;
  } catch (err) {
    console.error('Error handling callback:', err);
    return null;
  }
}; 