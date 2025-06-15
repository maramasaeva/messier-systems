"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleCallback } from '../../utils/spotifyAuth';

export default function Callback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      // Check if we're in the browser
      if (typeof window !== 'undefined') {
        try {
          // Get the code from URL search params
          const searchParams = new URLSearchParams(window.location.search);
          const errorParam = searchParams.get('error');
          
          if (errorParam) {
            console.error('Authentication error from URL params:', errorParam);
            setError(`Authentication error: ${errorParam}`);
            setTimeout(() => router.push('/'), 3000);
            return;
          }
          
          const code = searchParams.get('code');
          if (code) {
            try {
              console.log('Processing authorization code:', code.substring(0, 10) + '...');
              
              // Check if we have the code verifier
              const codeVerifier = localStorage.getItem('spotify_code_verifier');
              if (!codeVerifier) {
                console.error('No code verifier found in localStorage');
                setError('Authentication failed: Missing code verifier');
                setTimeout(() => router.push('/'), 3000);
                return;
              }
              
              // Process the callback
              const accessToken = await handleCallback(searchParams);
              
              if (accessToken) {
                console.log('Access token generated and saved successfully');
                // Redirect immediately on success
                router.push('/');
              } else {
                console.error('Failed to exchange code for access token');
                setError('Failed to get access token');
                setTimeout(() => router.push('/'), 3000);
              }
            } catch (err) {
              console.error('Error in callback processing:', err);
              setError(`Error processing authentication: ${err instanceof Error ? err.message : 'Unknown error'}`);
              setTimeout(() => router.push('/'), 3000);
            }
          } else {
            console.error('No authorization code found in URL');
            setError('No authorization code found in URL');
            setTimeout(() => router.push('/'), 3000);
          }
        } catch (err) {
          console.error('Unexpected error in callback processing:', err);
          setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setTimeout(() => router.push('/'), 3000);
        }
      }
    };
    
    processCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center">
        <h1 className="text-2xl font-mono text-pink-400">Authenticating with Spotify...</h1>
        <p className="mt-4 text-gray-400">You will be redirected shortly.</p>
        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 