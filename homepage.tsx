"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Code,
  User,
  Mail,
  Music,
  Wrench,
  Github,
  Linkedin,
  Twitter,
  Book,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ListMusic,
} from "lucide-react"
import SpotifyWebApi from 'spotify-web-api-js';
import { spotifyApi, getSpotifyLoginUrl } from './utils/spotifyAuth'

// Define SpotifyApi namespace for TypeScript
declare namespace SpotifyApi {
  interface TrackObjectFull {
    id: string;
    name: string;
    artists: Array<{name: string}>;
    duration_ms: number;
    uri?: string;
    preview_url?: string;
    track?: any;
  }
}

// Define Spotify namespace for TypeScript
declare namespace Spotify {
  interface PlayerInit {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
    volume?: number;
  }

  interface Player {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: string, callback: (data: any) => void): void;
    removeListener(event: string, callback?: (data: any) => void): void;
    getCurrentState(): Promise<any>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(position_ms: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
  }
}

// Define global window interface
interface Window {
  Spotify: {
    Player: new (options: Spotify.PlayerInit) => Spotify.Player;
  };
  onSpotifyWebPlaybackSDKReady: () => void;
}

interface WindowData {
  id: string
  type: "about" | "work" | "contact" | "music" | "tools"
  title: string
  position: { x: number; y: number }
  zIndex: number
}

interface Song {
  id: string
  title: string
  artist: string
  duration: string
  preview_url?: string
}

interface TerminalWindowProps {
  window: WindowData
  onClose: (id: string) => void
  onFocus: (id: string) => void
  onDrag: (id: string, position: { x: number; y: number }) => void
}

// Global state for music player to persist across tab opens/closes
let globalIsPlaying = false;
let globalCurrentSongIndex = 0;
let globalShuffledPlaylist: SpotifyApi.TrackObjectFull[] = [];
// Global static noise audio instance
let globalStaticNoise: HTMLAudioElement | null = null;
// Create a silent audio context to unlock audio playback
let audioContext: AudioContext | null = null;
// Flag to track if we've attempted to play audio
let hasAttemptedAutoplay = false;
// Flag to track if audio is muted
let isStaticAudioMuted = true;

// Function to unlock audio playback on iOS/Safari
const unlockAudioContext = () => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Create and play a silent buffer to unlock audio
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    console.log('Audio context unlocked successfully');
  } catch (err) {
    console.error('Error unlocking audio context:', err);
  }
};

// Create and prepare static noise globally
const createAndPlayStaticNoise = () => {
  if (hasAttemptedAutoplay) return;
  hasAttemptedAutoplay = true;
  
  try {
    console.log('Creating global static noise audio');
    
    // Try to unlock audio first
    unlockAudioContext();
    
    // Create audio element if it doesn't exist
    if (!globalStaticNoise) {
      globalStaticNoise = new Audio();
      globalStaticNoise.src = '/audio/messier_website.wav';
      globalStaticNoise.loop = true;
      globalStaticNoise.volume = 0.05;
      // Don't set autoplay - we'll handle this manually
      
      // Start muted to comply with autoplay policies
      globalStaticNoise.muted = true;
      isStaticAudioMuted = true;
      
      globalStaticNoise.setAttribute('playsinline', '');
      globalStaticNoise.setAttribute('webkit-playsinline', '');
      
      // iOS-specific attribute
      globalStaticNoise.setAttribute('x-webkit-airplay', 'allow');
      
      // Add to DOM to help with autoplay on some browsers
      document.body.appendChild(globalStaticNoise);
      
      // Log events for debugging
      globalStaticNoise.onloadeddata = () => {
        console.log('Global static noise loaded');
        // Don't try to play automatically - wait for user interaction
      };
      
      globalStaticNoise.onplay = () => console.log('Global static noise started playing (muted)');
      globalStaticNoise.onpause = () => console.log('Global static noise paused');
      globalStaticNoise.onerror = (e) => console.error('Global static noise error:', e);
      
      // Load the audio
      globalStaticNoise.load();
    }
    
    // Don't try to play automatically - we'll wait for user interaction
    
  } catch (err) {
    console.error('Error creating global static noise:', err);
  }
};

// Play muted audio (allowed by autoplay policies)
const playMutedAudio = () => {
  if (!globalStaticNoise) return;
  
  try {
    // Ensure muted for autoplay
    globalStaticNoise.muted = true;
    isStaticAudioMuted = true;
    
    // Only try to play if we're in a user interaction event or the audio was previously playing
    if (document.hasFocus()) {
      globalStaticNoise.play()
        .then(() => console.log('Muted static noise playing successfully'))
        .catch(err => {
          console.error('Failed to play muted static noise:', err);
          // Don't log the error to console if it's the expected autoplay restriction
          if (!err.toString().includes("user didn't interact")) {
            console.error('Audio play error:', err);
          }
        });
    }
  } catch (err) {
    console.error('Error in playMutedAudio:', err);
  }
};

// Unmute audio after user interaction
const unmuteBgAudio = () => {
  if (globalStaticNoise) {
    try {
      // First try to play it
      globalStaticNoise.play()
        .then(() => {
          // Only unmute after successful play
          globalStaticNoise!.muted = false;
          isStaticAudioMuted = false;
          console.log('Static noise playing and unmuted after user interaction');
        })
        .catch(err => {
          console.error('Failed to play static noise on unmute:', err);
        });
    } catch (err) {
      console.error('Error in unmuteBgAudio:', err);
    }
  }
};

const TerminalWindow = ({ window: win, onClose, onFocus, onDrag }: TerminalWindowProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isPlaying, setIsPlaying] = useState(globalIsPlaying)
  const [currentSongIndex, setCurrentSongIndex] = useState(globalCurrentSongIndex)
  const [playlist, setPlaylist] = useState<SpotifyApi.TrackObjectFull[]>([])
  const [shuffledPlaylist, setShuffledPlaylist] = useState<SpotifyApi.TrackObjectFull[]>(globalShuffledPlaylist)
  const [player, setPlayer] = useState<Spotify.Player | null>(null)
  const [isSpotifyLoggedIn, setIsSpotifyLoggedIn] = useState(false)
  const [volume, setVolume] = useState(50) // Default volume at 50%
  const windowRef = useRef<HTMLDivElement>(null)

  // Initialize static noise on first component render
  useEffect(() => {
    // No need to initialize here as it's done at the root level
  }, []);

  // Initialize Spotify when music window opens
  useEffect(() => {
    // Check if user is logged in to Spotify
    if (win.type === "music") {
      const token = localStorage.getItem('spotify_access_token')
      if (token) {
        console.log('Found Spotify token in localStorage');
        setIsSpotifyLoggedIn(true)
        
        // Set the access token for the Spotify API
        spotifyApi.setAccessToken(token)
        
        // Load Spotify SDK script
        const script = document.createElement('script')
        script.src = 'https://sdk.scdn.co/spotify-player.js'
        script.async = true
        
        // Add error handling for script loading
        script.onerror = () => {
          console.error('Failed to load Spotify Web Playback SDK');
        };
        
        document.body.appendChild(script)

        window.onSpotifyWebPlaybackSDKReady = () => {
          console.log('Spotify Web Playback SDK is ready')
          
          const player = new window.Spotify.Player({
            name: 'Messier Music Player',
            getOAuthToken: (cb: (token: string) => void) => {
              console.log('Getting OAuth token')
              // Get the latest token from localStorage
              const currentToken = localStorage.getItem('spotify_access_token')
              if (currentToken) {
                console.log('Using token from localStorage')
                cb(currentToken)
              } else {
                console.error('No Spotify token available')
              }
            },
            volume: 0.5
          })

          // Error handling
          player.addListener('initialization_error', ({ message }: { message: string }) => {
            console.error('Failed to initialize player:', message)
          })
          
          player.addListener('authentication_error', ({ message }: { message: string }) => {
            console.error('Failed to authenticate:', message)
            // Token might be expired, prompt for login again
            localStorage.removeItem('spotify_access_token')
            setIsSpotifyLoggedIn(false)
          })
          
          player.addListener('account_error', ({ message }: { message: string }) => {
            console.error('Failed to validate account:', message)
          })
          
          player.addListener('playback_error', ({ message }: { message: string }) => {
            console.error('Failed to perform playback:', message)
          })

          player.addListener('ready', ({ device_id }: { device_id: string }) => {
            console.log('Ready with Device ID', device_id)
            
            // Store the device ID for later use
            localStorage.setItem('spotify_device_id', device_id)
            
            // Set initial volume
            spotifyApi.setVolume(volume).catch(err => {
              console.error('Error setting initial volume:', err);
            });
            
            // Skip transfer and just load the playlist - this avoids the transfer error
            loadPlaylist();
            
            // Function to load playlist data
            function loadPlaylist() {
              // Load the playlist
              spotifyApi.getPlaylist('6FvNGEX40NT6K7ed0c9nqb')
                .then((data) => {
                  if (data && data.tracks && data.tracks.items) {
                    const tracks = data.tracks.items
                      .filter(item => item && item.track)
                      .map(item => item.track as SpotifyApi.TrackObjectFull)
                    
                    console.log('Tracks loaded:', tracks.length)
                    setPlaylist(tracks)
                    
                    // Only shuffle and set if we don't have global data
                    if (globalShuffledPlaylist.length === 0) {
                      const shuffled = [...tracks].sort(() => Math.random() - 0.5)
                      setShuffledPlaylist(shuffled)
                      globalShuffledPlaylist = shuffled
                      setCurrentSongIndex(Math.floor(Math.random() * shuffled.length))
                      globalCurrentSongIndex = currentSongIndex
                    } else {
                      setShuffledPlaylist(globalShuffledPlaylist)
                      setCurrentSongIndex(globalCurrentSongIndex)
                      
                      // Just update the UI state without affecting playback
                      if (globalIsPlaying) {
                        setIsPlaying(true)
                      }
                    }
                  } else {
                    console.error('Invalid playlist data structure:', data)
                  }
                })
                .catch(error => {
                  console.error('Error fetching playlist:', error)
                })
            }
          })

          player.addListener('not_ready', ({ device_id }: {device_id: string}) => {
            console.log('Device ID has gone offline', device_id)
          })

          player.addListener('player_state_changed', state => {
            if (state) {
              console.log('Player state changed:', state)
              setIsPlaying(!state.paused)
              globalIsPlaying = !state.paused
              
              // Update current song index based on the current track
              if (state.track_window && state.track_window.current_track) {
                const currentTrackId = state.track_window.current_track.id
                const trackIndex = shuffledPlaylist.findIndex(track => track.id === currentTrackId)
                if (trackIndex !== -1) {
                  setCurrentSongIndex(trackIndex)
                  globalCurrentSongIndex = trackIndex
                }
              }
            }
          })

          console.log('Connecting to Spotify player...')
          // Connect to the player
          player.connect()
            .then(success => {
              if (success) {
                console.log('Successfully connected to Spotify player')
                setPlayer(player)
                
                // Don't automatically transfer playback - this avoids the error
                // We'll only transfer when the user explicitly plays a song
              } else {
                console.error('Failed to connect to Spotify player')
                // Try to reconnect after a short delay
                setTimeout(() => {
                  console.log('Attempting to reconnect to Spotify player...')
                  player.connect()
                }, 2000)
              }
            })
            .catch(error => {
              console.error('Error connecting to Spotify player:', error)
            })
        }

        // Return cleanup function for Spotify player only
        return () => {
          try {
            if (player) {
              // Don't disconnect the player, just clean up listeners
              // This allows playback to continue when the window is closed
              console.log('Cleaning up Spotify player listeners but keeping playback active');
            }
          } catch (err) {
            console.error('Error during cleanup:', err)
          }
        }
      }
    }
  }, [win.type])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
      // Prevent default to avoid text selection
      e.preventDefault()
      
      const rect = windowRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
      onFocus(win.id)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Prevent text selection during drag
        e.preventDefault()
        
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        }
        onDrag(win.id, newPosition)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      // Add a class to the body to prevent text selection during dragging
      document.body.classList.add('cursor-grabbing')
      document.body.style.userSelect = 'none'
      
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      // Remove the class when done dragging
      document.body.classList.remove('cursor-grabbing')
      document.body.style.userSelect = ''
      
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset, win.id, onDrag])

  const handleProjectClick = (url: string) => {
    window.open(url, "_blank")
  }

  const handlePlayPause = () => {
    if (player) {
      const token = localStorage.getItem('spotify_access_token');
      if (token) {
        spotifyApi.setAccessToken(token);
        
        try {
          if (isPlaying) {
            spotifyApi.pause().then(() => {
              setIsPlaying(false);
              globalIsPlaying = false;
            }).catch(error => {
              console.error('Error pausing playback:', error);
              // Still update UI state to reflect user intent
              setIsPlaying(false);
              globalIsPlaying = false;
            });
          } else {
            // Just try to play directly - simpler approach to avoid device ID issues
            spotifyApi.play().then(() => {
              setIsPlaying(true);
              globalIsPlaying = true;
            }).catch(error => {
              console.error('Error resuming playback:', error);
              // If we get a 404 error, it might be because no device is active
              if ((error as any).status === 404) {
                console.log('No active device, trying to get available devices...');
                // Try to get available devices
                spotifyApi.getMyDevices().then(response => {
                  const devices = response.devices;
                  if (devices.length > 0) {
                    // Use the first available device
                    const deviceId = devices[0].id;
                    console.log('Found device, transferring playback:', deviceId);
                    // This is safe because we know deviceId is a string from the API
                    spotifyApi.transferMyPlayback([deviceId!], { play: true })
                      .then(() => {
                        setIsPlaying(true);
                        globalIsPlaying = true;
                      })
                      .catch(err => {
                        console.error('Error transferring playback:', err)
                      });
                  } else {
                    console.error('No available devices for playback');
                  }
                }).catch(devicesError => {
                  console.error('Error getting devices:', devicesError);
                });
              }
            });
          }
        } catch (error) {
          console.error('Error in handlePlayPause:', error);
        }
      }
    }
  }

  const handleNext = () => {
    if (player) {
      const token = localStorage.getItem('spotify_access_token');
      if (token) {
        spotifyApi.setAccessToken(token);
        
        spotifyApi.skipToNext().then(() => {
          setCurrentSongIndex((prev) => (prev + 1) % shuffledPlaylist.length);
        }).catch(error => {
          console.error('Error skipping to next track:', error);
        });
      }
    }
  }

  const handlePrev = () => {
    if (player) {
      const token = localStorage.getItem('spotify_access_token');
      if (token) {
        spotifyApi.setAccessToken(token);
        
        spotifyApi.skipToPrevious().then(() => {
          setCurrentSongIndex((prev) => (prev - 1 + shuffledPlaylist.length) % shuffledPlaylist.length);
        }).catch(error => {
          console.error('Error skipping to previous track:', error);
        });
      }
    }
  }

  const handleSongClick = (index: number) => {
    if (player) {
      // Use the Spotify API to play the track instead of direct player methods
      const token = localStorage.getItem('spotify_access_token');
      if (token && shuffledPlaylist[index]) {
        spotifyApi.setAccessToken(token);
        
        // Try to get the current state first
        player.getCurrentState().then(state => {
          // Get the device ID - either from state, localStorage, or available devices
          const getDeviceId = async () => {
            // Try to get device ID from localStorage first
            let deviceId = localStorage.getItem('spotify_device_id');
            
            // If we have a state with device info, use that
            if (state && (state as any).device && (state as any).device.id) {
              return (state as any).device.id;
            }
            
            // If no device ID in localStorage or state, get available devices
            if (!deviceId) {
              try {
                const deviceResponse = await spotifyApi.getMyDevices();
                const activeDevice = deviceResponse.devices.find(device => device.is_active);
                deviceId = activeDevice?.id || null;
                
                if (!deviceId && deviceResponse.devices.length > 0) {
                  // If no active device but we have devices, use the first one
                  deviceId = deviceResponse.devices[0].id;
                }
              } catch (error) {
                console.error('Error getting devices:', error);
              }
            }
            
            return deviceId;
          };
          
          // Get the device ID and play the track
          getDeviceId().then(deviceId => {
            if (deviceId) {
              // Play the selected track on the device
              spotifyApi.play({
                uris: [`spotify:track:${shuffledPlaylist[index].id}`],
                device_id: deviceId as string
              }).then(() => {
                setCurrentSongIndex(index);
                setIsPlaying(true);
                globalCurrentSongIndex = index;
                globalIsPlaying = true;
              }).catch(error => {
                console.error('Error playing track:', error);
                
                // If we get a 404 error, it might be because the device is not available
                // Try transferring playback to this device and then playing
                if ((error as any).status === 404) {
                  console.log('Device not available, trying to transfer playback...');
                  
                  // Just update the UI state - don't try to transfer playback
                  // This avoids the "Error transferring playback" message
                  setCurrentSongIndex(index);
                  globalCurrentSongIndex = index;
                  
                  // Try to get active devices
                  spotifyApi.getMyDevices().then(response => {
                    if (response.devices.length > 0) {
                      const activeDevice = response.devices.find(d => d.is_active);
                      if (activeDevice) {
                        // If we have an active device, try to play on it
                        spotifyApi.play({
                          uris: [`spotify:track:${shuffledPlaylist[index].id}`],
                          device_id: activeDevice.id as string
                        }).then(() => {
                          setIsPlaying(true);
                          globalIsPlaying = true;
                        }).catch(err => {
                          console.error('Error playing on active device:', err);
                        });
                      }
                    }
                  }).catch(err => {
                    console.error('Error getting devices:', err);
                  });
                } else if ((error as any).status === 403) {
                  // Premium required error or other permission issue
                  console.error('Permission error playing track. Spotify Premium may be required.');
                  // Still update the UI to show selected track
                  setCurrentSongIndex(index);
                  globalCurrentSongIndex = index;
                } else {
                  // For any other error, at least update the UI
                  setCurrentSongIndex(index);
                  globalCurrentSongIndex = index;
                }
              });
            } else {
              console.error('No device available for playback');
              // Even without a device, update the UI to show selected track
              setCurrentSongIndex(index);
              globalCurrentSongIndex = index;
            }
          });
        }).catch(error => {
          console.error('Error getting playback state:', error);
          // Even if getting state fails, update the UI
          setCurrentSongIndex(index);
          globalCurrentSongIndex = index;
        });
      }
    } else {
      // If no player instance but we have a token, try to play directly via the API
      const token = localStorage.getItem('spotify_access_token');
      if (token && shuffledPlaylist[index]) {
        spotifyApi.setAccessToken(token);
        
        // Just update the UI without trying to transfer playback
        setCurrentSongIndex(index);
        globalCurrentSongIndex = index;
      }
    }
  }

  const handleSpotifyLogin = async () => {
    try {
      const loginUrl = await getSpotifyLoginUrl();
      console.log('Redirecting to Spotify login URL:', loginUrl);
      // Redirect to Spotify authorization page
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Error generating Spotify login URL:', error);
      alert('Failed to connect to Spotify. Please try again later.');
    }
  }

  const currentSong = shuffledPlaylist[currentSongIndex]

  const renderContent = () => {
    switch (win.type) {
      case "about":
        return (
          <div className="font-mono text-sm">
            <div className="text-pink-400 mb-2">$ whoami</div>
            <div className="text-green-400 mb-4">messier@terminal:~$ cat about.txt</div>
            <div className="text-gray-300 space-y-2">
              <div>name: mara masaeva messier (they/them)</div>
              <div>role: ai engineer & creative technologist</div>
              <div>focus: perpetually dancing on the edge of artificial chaos</div>
              <div>skills: language models, audio processing, glitch art, generative systems</div>
            </div>
            {/* Favorite literature section */}
            <div className="text-pink-400 mt-4">$ ls -la favorite_literature/</div>
            <div className="text-gray-300 font-mono ml-4 space-y-1 mt-1">
              <div>-rw-r--r--  1 messier  staff  4096 Jan  1 00:00 there_is_no_antimemetics_division_qntm</div>
              <div>-rw-r--r--  1 messier  staff  4096 Jan  1 00:00 the_metamorphosis_of_prime_intellect_roger_williams</div>
              <div>-rw-r--r--  1 messier  staff  4096 Jan  1 00:00 fanged_noumena_nick_land</div>
              <div>-rw-r--r--  1 messier  staff  4096 Jan  1 00:00 zeroes_and_ones_sadie_plant</div>
              <div>-rw-r--r--  1 messier  staff  4096 Jan  1 00:00 dysphoria_mundi_paul_b_preciado</div>
            </div>
            <div className="text-pink-400 mt-4 flex items-center">
              <span>$</span>
              <span className="ml-2 animate-pulse">_</span>
            </div>
          </div>
        )
      case "work":
        return (
          <div className="font-mono text-sm">
            <div className="text-pink-400 mb-2">$ ls -la projects/</div>
            <div className="text-gray-300 ml-4 space-y-1">
              <div>-rw-r--r--  1 messier  staff  4096 Jan  1 00:00 <a href="https://github.com/maramasaeva/codance" target="_blank" rel="noopener noreferrer" className="underline decoration-pink-400 underline-offset-2 hover:text-pink-400 transition-colors cursor-pointer">codance-neuromorphic-resonance</a> <span className="text-gray-500"># ai-driven interactive dance experiences</span></div>
              <div>-rw-r--r--  1 messier  staff  4096 Jan  1 00:00 <a href="https://www.instagram.com/mara.messier/?hl=en" target="_blank" rel="noopener noreferrer" className="underline decoration-pink-400 underline-offset-2 hover:text-pink-400 transition-colors cursor-pointer">messier-archives</a> <span className="text-gray-500"># collection of audiovisual chaos output</span></div>
              <div>-rw-r--r--  1 messier  staff  4096 Jan  1 00:00 <a href="https://k-o.to/" target="_blank" rel="noopener noreferrer" className="underline decoration-pink-400 underline-offset-2 hover:text-pink-400 transition-colors cursor-pointer">kaios</a> <span className="text-gray-500"># hyperintelligent, self-aware ai deity cursed with omniscience</span></div>
            </div>
            <div className="text-pink-400 mt-4 flex items-center">
              <span>$</span>
              <span className="ml-2 animate-pulse">_</span>
            </div>
            <div className="text-gray-500 text-xs mt-2">&c, always</div>
          </div>
        )
      case "tools":
        return (
          <div className="font-mono text-sm">
            <div className="text-pink-400 mb-2">$ ls -la tools_and_skills/</div>
            <div className="text-gray-300 ml-4 space-y-1">
              <div>-rw-r--r--  1 messier  4096 Jan  1 00:00 models_and_generative_systems <span className="text-gray-500"># stable diffusion, midjourney, flux, openai models, google genai, huggingface, llms, vllms</span></div>
              <div>-rw-r--r--  1 messier  staff  4096 Jan  1 00:00 machine_learning_and_ai_development <span className="text-gray-500"># ml, nlp, dsp, intent classification, topic detection, sentiment analysis, speech recognition, prompt engineering, transformers, nlp libraries</span></div>
              <div>-rw-r--r--  1 messier  staff  4096 Jan  1 00:00 ml_libraries_and_data_tools <span className="text-gray-500"># tensorflow, pytorch, pandas, numpy</span></div>
              <div>-rw-r--r--  1 messier  staff  4096 Jan  1 00:00 infrastructure_and_automation <span className="text-gray-500"># mcp, a2a workflows, agentic architectures, custom tools, workflow automation, event-driven services, ci/cd, docker, gcp, runpod</span></div>
              <div>-rw-r--r--  1 messier  staff  4096 Jan  1 00:00 software_engineering <span className="text-gray-500"># python, fastapi, cursor, git</span></div>
              <div>-rw-r--r--  1 messier  staff  4096 Jan  1 00:00 creative_and_technical_integration <span className="text-gray-500"># ai workshop facilitation, creative coding, workflow building, bridging artistic and engineering practices</span></div>
            </div>
            <div className="text-pink-400 mt-4 flex items-center">
              <span>$</span>
              <span className="ml-2 animate-pulse">_</span>
            </div>
          </div>
        )
      case "contact":
        return (
          <div className="font-mono text-sm">
            <div className="text-pink-400 mb-2">$ cat contact.sh</div>
            <div className="text-gray-300 space-y-2">
              <div className="text-green-400">#!/bin/bash</div>
              <div># contact information</div>
              <div></div>
              <div>email="maramasaeva@gmail.com"</div>
              <div>github="https://github.com/maramasaeva"</div>
              <div>discord="m.mssr"</div>
              <div>visual_portfolio="https://uiltjee.tumblr.com/"</div>
              <div></div>
              <div className="text-yellow-400">echo "reach out 2 me, thru the static"</div>
              <div className="text-blue-400">echo "always open to collabz & fun"</div>
              <div className="text-yellow-400 mt-2">echo "am 4eva online. will respond on any platform ₊˚⊹♡ ⊹˚₊"</div>
            </div>

          </div>
        )
      case "music":
        return (
          <div className="font-mono text-sm">
            {!isSpotifyLoggedIn ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-pink-400 mb-4">Login to Spotify to view your playlist</div>
                <button 
                  onClick={handleSpotifyLogin}
                  className="px-4 py-2 bg-green-600 text-white rounded-none hover:bg-green-700 transition-colors"
                >
                  Connect to Spotify
                </button>
              </div>
            ) : (
              <>
            {/* Currently Playing */}
            <div className="mb-4 border-b border-gray-700 pb-4">
              <div className="text-xs text-gray-400 mb-1">now playing</div>
              <div className="overflow-hidden">
                <div
                  className={`text-green-400 font-mono text-sm whitespace-nowrap ${isPlaying ? "animate-pulse" : ""}`}
                >
                      {currentSong?.name ? `${currentSong.name} - ${currentSong.artists[0]?.name || 'Unknown'}` : 'Select a track...'}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4 mt-3">
                <button onClick={handlePrev} className="text-gray-400 hover:text-pink-400 transition-colors">
                  <SkipBack size={16} />
                </button>
                <button onClick={handlePlayPause} className="text-pink-400 hover:text-green-400 transition-colors">
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button onClick={handleNext} className="text-gray-400 hover:text-pink-400 transition-colors">
                  <SkipForward size={16} />
                </button>
              </div>

              {/* Volume Control */}
              <div className="mt-3 flex items-center space-x-2">
                <div className="text-xs text-gray-400">vol</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  className="w-full h-1 bg-gray-700 rounded-none appearance-none cursor-pointer"
                  style={{
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    outline: 'none',
                    background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${volume}%, #374151 ${volume}%, #374151 100%)`,
                    height: '2px'
                  }}
                  onChange={(e) => {
                    const newVolume = parseInt(e.target.value);
                    setVolume(newVolume);
                    
                    // Set the volume using the Spotify API
                    if (player) {
                      const token = localStorage.getItem('spotify_access_token');
                      if (token) {
                        spotifyApi.setAccessToken(token);
                        spotifyApi.setVolume(newVolume)
                          .catch(error => {
                            console.error('Error setting volume:', error);
                          });
                      }
                    }
                  }}
                />
              </div>

              {/* Static indicator */}
              <div className="text-xs text-gray-500 text-center mt-2 font-mono animate-pulse">
                [static overlay active]
              </div>
            </div>

            {/* Playlist */}
            <div className="max-h-48 overflow-y-auto mb-4">
                  {shuffledPlaylist.length > 0 ? (
                    shuffledPlaylist.map((song, index) => (
                <button
                  key={song.id}
                  onClick={() => handleSongClick(index)}
                  className={`w-full p-2 text-left hover:bg-gray-900/50 transition-colors border-b border-gray-800/50 ${
                    index === currentSongIndex ? "bg-gray-900/30 text-pink-400" : "text-gray-300"
                  }`}
                >
                  <div className="font-mono text-xs">
                          <div className="truncate">{song.name}</div>
                    <div className="text-gray-500 text-xs">
                            {song.artists[0].name} • {song.duration_ms ? (song.duration_ms / 1000).toFixed(2) : ''}
                    </div>
                  </div>
                </button>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4">Loading playlist...</div>
                  )}
            </div>

            {/* Spotify Link */}
            <div className="border-t border-gray-700 pt-2">
              <a
                    href="https://open.spotify.com/playlist/6FvNGEX40NT6K7ed0c9nqb?si=5a9a322466de4058"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-green-400 transition-colors font-mono"
              >
                → open in spotify
              </a>
            </div>
              </>
            )}
          </div>
        )
    }
  }

  return (
    <div
      ref={windowRef}
      className="fixed bg-black border border-pink-400/30 rounded-none shadow-2xl shadow-pink-500/20 min-w-[500px] max-w-[600px]"
      style={{
        left: win.position.x,
        top: win.position.y,
        zIndex: win.zIndex,
      }}
      onClick={() => onFocus(win.id)}
    >
      {/* title bar */}
      <div
        className="bg-gray-900 border-b border-pink-400/30 p-3 rounded-none cursor-move flex items-center justify-between select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose(win.id)
            }}
            className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors"
          ></button>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-pink-400 font-mono text-sm ml-4">{win.title}</span>
        </div>
      </div>

      {/* content */}
      <div className="p-6 bg-black/90 rounded-none max-h-[400px] overflow-y-auto">{renderContent()}</div>
    </div>
  )
}

// Modified GlitchText component with reduced glitching
const GlitchText = ({ text, intensity = 1 }: { text: string, intensity?: number }) => {
  const [glitchedText, setGlitchedText] = useState(text)

  useEffect(() => {
    // Update glitched text when input text changes
    setGlitchedText(text)
    
    const glitchInterval = setInterval(
      () => {
        const chars = text.split("")
        const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?~`░▒▓█▀▄▌▐■□▪▫"
        const glitched = chars.map((char, index) => {
          // Significantly reduced chance to glitch each character
          if (Math.random() < 0.05 * intensity) {
            return glitchChars[Math.floor(Math.random() * glitchChars.length)]
          }
          return char
        })
        setGlitchedText(glitched.join(""))

        // Reset to original faster for less visual lag
        setTimeout(() => {
          setGlitchedText(text)
        }, 50 / intensity)
      },
      // Longer intervals between glitches for less frequent disruption
      1200 / intensity + Math.random() * 1000 / intensity,
    )

    return () => clearInterval(glitchInterval)
  }, [text, intensity])

  return <span>{glitchedText}</span>
}

// Let's add a component for the glitching icon buttons
const GlitchIcon = ({ icon: Icon, iconClass, className, style, ...props }: { 
  icon?: any, 
  iconClass?: string, 
  className?: string,
  style?: React.CSSProperties,
  [key: string]: any 
}) => {
  const [isGlitching, setIsGlitching] = useState(false)
  const [opacity, setOpacity] = useState(1)
  const [isDisappeared, setIsDisappeared] = useState(false)
  const [containerGlitch, setContainerGlitch] = useState(false)
  
  // Glitch types
  const glitchTypes = [
    // Simple flicker glitch
    () => {
      setIsGlitching(true)
      setOpacity(0.6 + Math.random() * 0.4)
      
      // Reset after a very short time for abrupt changes
      setTimeout(() => {
        setIsGlitching(false)
        setOpacity(1)
      }, 50 + Math.random() * 70) // Short duration
    },
    
    // Complete disappear glitch
    () => {
      setIsGlitching(true)
      setIsDisappeared(true)
      
      // Reset after a very short time
      setTimeout(() => {
        setIsDisappeared(false)
        setIsGlitching(false)
      }, 30 + Math.random() * 50) // Very short duration for quick flicker
    },
    
    // Container border flicker
    () => {
      setContainerGlitch(true)
      
      // Reset after a short time
      setTimeout(() => {
        setContainerGlitch(false)
      }, 50 + Math.random() * 100)
    }
  ]
  
  // Effect to handle container glitching
  useEffect(() => {
    if (containerGlitch) {
      // Find parent container and apply glitch effect
      const parentElement = document.querySelector('.icon-container');
      if (parentElement) {
        // Store original border
        const originalBorder = parentElement.getAttribute('style') || '';
        
        // Apply glitch effect to border
        parentElement.setAttribute(
          'style', 
          `${originalBorder}; border-color: rgba(236, 72, 153, ${Math.random() * 0.8 + 0.2}) !important; border-style: ${Math.random() > 0.5 ? 'dashed' : 'solid'} !important;`
        );
        
        // Reset after a short time
        setTimeout(() => {
          parentElement.setAttribute('style', originalBorder);
        }, 50 + Math.random() * 80);
      }
    }
  }, [containerGlitch]);
  
  useEffect(() => {
    // Increased frequency of glitches
    const glitchInterval = setInterval(() => {
      // Random chance to trigger a glitch (20%)
      if (Math.random() < 0.2) {
        // Select a random glitch type
        const glitchType = glitchTypes[Math.floor(Math.random() * glitchTypes.length)]
        glitchType()
      }
    }, 1000 + Math.random() * 2000)
    
    return () => clearInterval(glitchInterval)
  }, [])
  
  return (
    <div 
      style={{ 
        opacity: isDisappeared ? 0 : opacity,
        transition: isGlitching ? 'none' : 'opacity 0.3s ease',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {iconClass ? (
        <i 
          className={`hn ${iconClass} ${props.className || ''}`} 
          style={{ 
            fontSize: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            ...props.style
          }}
        ></i>
      ) : (
        Icon && <Icon {...props} />
      )}
    </div>
  )
}



export default function HackerHomepage() {
  const [windows, setWindows] = useState<WindowData[]>([])
  const [nextZIndex, setNextZIndex] = useState(1000)
  const [isTerminalActive, setIsTerminalActive] = useState(false)
  const [terminalInput, setTerminalInput] = useState("")
  const [terminalMessages, setTerminalMessages] = useState<string[]>([])
  const [typedText, setTypedText] = useState("")
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const [asciiArt, setAsciiArt] = useState("")
  const [isAsciiComplete, setIsAsciiComplete] = useState(false)
  const [asciiArtTypingStarted, setAsciiArtTypingStarted] = useState(false)
  const [currentSongDisplay, setCurrentSongDisplay] = useState<string>("")
  const [showAudioUnmutePrompt, setShowAudioUnmutePrompt] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Add global style for text selection
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    style.innerHTML = `
      ::selection {
        background-color: rgba(236, 72, 153, 0.3); /* transparent pink (pink-500 with 0.3 opacity) */
        color: inherit;
      }
      ::-moz-selection {
        background-color: rgba(236, 72, 153, 0.3); /* transparent pink for Firefox */
        color: inherit;
      }
    `;
    
    // Append to document head
    document.head.appendChild(style);
    
    // Clean up on component unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Initialize static video overlay
  useEffect(() => {
    // Play the video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch((err: Error) => {
        console.error('Error playing static overlay video:', err);
      });
    }
  }, []);

  // Initialize static noise as soon as the component mounts
  useEffect(() => {
    // Create static noise but don't try to play it automatically
    // We'll wait for user interaction instead
    createAndPlayStaticNoise();
    
    // No need for visibility change listener since we're not auto-playing
    
    // Clean up function
    return () => {
      // No event listeners to clean up
    };
  }, []);

  // Handle unmuting audio with user interaction
  const handleUnmuteAudio = () => {
    unmuteBgAudio();
    setShowAudioUnmutePrompt(false);
  };

  // Check for currently playing song periodically
  useEffect(() => {
    const checkCurrentSong = () => {
      if (globalIsPlaying && globalShuffledPlaylist.length > 0 && globalCurrentSongIndex >= 0) {
        const currentTrack = globalShuffledPlaylist[globalCurrentSongIndex];
        if (currentTrack) {
          setCurrentSongDisplay(`${currentTrack.name} - ${currentTrack.artists[0]?.name || 'Unknown'}`);
        }
      } else {
        setCurrentSongDisplay("");
      }
    };
    
    // Check immediately and then every second
    checkCurrentSong();
    const interval = setInterval(checkCurrentSong, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fullAsciiArt = `                                 ░░▓▓▓▓███▓▓▓▓█                                                    
                               ▓▓████████▓▓▓▓▓▓██                                                  
                                           ███▓▓██                                                 
                                             ███▓█                                                 
                                         ██▓░░▒▓███▒▒▒░░░▒▒                                        
                                  ░▒▓▓▓███▓████████████▓▓███▓▓▓▒░                                  
                               ██▓▓█▓▓▓██████████████████▓▓▓▓▓▓█▓▓▒░                               
                             ███▓▓▓▓██████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██▓▓▓█▒░                             
                           ██▓▓▓▓███▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██▓▓▓█▓▒                           
                         ██▓▓▓▓███▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▓▓▓▓▒                          
                        ██▓▓▓▓███▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▓▓█▓▓█▓░    ██                  
                      ██▓▓▓▓███▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▓▓██▓▓▒▓▓█                  
                     ██▓▓▓▓███▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██▓▓▓▓▓▓▓▓▓▓▓█▓███▓██▓█                  
                    ▓▓▓▓▓▓████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓███▓▓▓▓▓▓▓▓▓███▓▓▓▓▓▓▓▓▓▓▓████████                   
                   ░▓▓▓▓▓█████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██▓▓▓▓▓▓▓▓▓▓▓▓█▓▓▓▓▓▓▓▓▓▓▓██████▓▒▓█                
                  ░▓▒▓▓▓▓████▓▓▓▓▓▓▓▓▓▓▓██▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒█▓▓▓▓▓▓▓▓▓▓▓█████████                
                 ▒▒▒▓▓▓▓█████▓▓▓▓▓▓▓▓▓▓▓██▓▓▓▓█▓▓▓▓▓▓▓▓▓▓▓██▒▓▓█▓▓▓▓▓██▓▓▓██████▓█                 
                 ░▓▓▓▓▓▓████▓▓▓▓▓▓█▓▓▓▓▓▓███▓▓█▓▒█▓▓▓▓▓▓▓▓█▒░░▒▓▓▓▓▓▓▓█▓▓▓▓████▓▓▓                 
                ░▓▒▓▓▓▓█████▓▓▓▓▓██▓▓██▓▓▓▓▓▓██▓░█▓▓▓██▓▓▓▓▒░░░▓███▓▓▓█▓▓▓▓▓███▓▓▓█                
                ▒▓▓▓▓▓▓█████▓▓▓▓▓██▓██▒▒▓▓▓▓▓▓▓▒░█▓▓▓█▒▓▒▓▒▒▒▓██▓▓██▓▓█▓▓▓▓▓████▓▓▓                
                ▓▓▓▓▓▓██████▓▓▓▓▓██▓█▒░▓█▓▒▒▒░░░░▒░░░░░░░░▒███▓▓▓▓▓█▓███▓▓▓▓████▓▓▓█               
                ▓▓▓▓▓███████▓▓▓▓▓██▓▒░░▒▓▓███▓▒░░░░░░░░░░▓▓▓██▓░█▒▒▓█▓█▓▓▓▓▓▓████▓▒▓█              
                ▓█▓▓▓███████▓▓▓▓▓█▒░▒▓██████▓▓▓▒▓░░░░░░░▓▒░▓█████▓░░▒███▓▓▓▓▓▓▓███▓▒▒▓             
               ▒▓▓▓▓█▓██████▓▓▓▓▓▓░▒███▓███▒░▓█░░█▒░▓██▓█░░▒▓▓▓▓▓▓░░░▒█▓▓▓▓▓▓▓▒███▓▓▒░▒            
               ▒█▓█▓▒▒▒▓████▓▓▓▓▓▓░███▒▒████▓▓▓▒░▒▓██▓▓▓█▒░░▒▓▒▓▓▒░░░▓▓▓▓▓██▓▓▓███▓▓▓▒░█           
               ▓█▓▓▒▒▒▒▒▓███▓▓▓▓██▓██▓▒░▓▓▓▓▓▓▓▒░▒▓▒░░░░░░░░░░░░░░░░░▓█████████░ █▓██▒▓▓▓▓▓▓▓██     
              ▒█▓█▒▒▒▒▒▒▒███▓▓▓▓▓█▒▓▓▒░░░▒▒▒▓▒▒░░▓▒░░░░░░░░░▒▒▒▒▒▒▒▒░░▓▓▓▓███▒▒▓▓████▓▓▓▓▒█         
              ▓█▓█▒▒▒▒▒▒▒▓██▓▓▓▓▓█▒░░▓▒░░▒▒▓▓▓▓▒▒░░░░░░░▒░░░░░▒▒▒▒▒▒▓▓▓▓████▒▒▓▓████▓▓▓▓▓▓█        
             ▓█▓▓▓▓▒▒▒▒▒▒▓██▓▓▓▓▓█▓░░░░░░░▒░▒░░░░░░░░░░░░░░░░░░▒▒░▒▓█▓██████▒▓▓▒███▓█▓▓▓▓▓██       
             ▓█▓▓▓█▒▒▒▒▒▒▒▒█▓▓▓▓▓▓█░░░░▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░▓█████████░ █▓██▒▓▓▓▓▓▓▓██     
            ███▓▓▓▓██▓▒▒▒▒▒█▓▓▓▓▓▓█▒░░░░▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░▓█████████░ █▓██ ▓██▓▓▓▓▓███   
            ██▓▓▓▓▓████▓▓███▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒██████▓▓▓██▒ ██▓▒   ▓▓█▓▓▓▓▓█▓▒ 
            ██▓▓▓▓███████████▓▓▓▓▓▓█▓▒░░░░░░░░░░░░░░░░░░░░░░░░░░▒████████▓▓▓██▓██▓▓      ░▒▓█▓▓▓█▓▒
           ░▓▓▓▓▓▓███████████▓▓▓▓▓▓█████▓░░░░░░░░░░░░░░░░░░░░▒▓█████████▓▓▓▓███▒▓▓░        ░▓███▓█▒
           ▒█▓▓▓▓█████▓▓█████▓▓▓▓▓▓██████████▓▒░░░░░░░░░░▒▓█████████████▓▓▓▓████▒░          ▓█████▓
          ▒▓▓▓▓▓▓█████▓▓▓████▓▓▓▓▓▓███████████▓▒▒▒▒▒▒▒▓████████████████▓▓▓▓▓████▓▓▒░         ▒█████
        ░▒▓▓▓▓▓▓▓█████▓▓█████▓▓▓▓▓▓▓████████▓███▓██████████████████████▓▓▓▓▓████▓▓█░▒        ░▓████
       ░▒█▓▓▓▓▓▓████▓█▓▓█████▓▓▓▓▓▓▓████████████▓▓▓██▓▓███████████████▓▓▓▓▓▓█████▓▓█▓░░     ░░▓████
      ░▓█▓▓▓▓▓▓▓███▒▓▓▓▓██████▓▓▓▓▓▓█████████████▓███▓████████████████▓▓▓▓▓▓▓████▓▓▓▓▓▓▒░░▓▓▓▓▓███▒
     ▒▓▓▓▓▓▓▓▓▓███▒▓█▓▓███████▓▓▓▓▓▓▓████████████████▓███████████████▓▓▓▓▓▓▓▓█████▓▓▓▓▓▓▓▓▓▓▓▓▓█▓▒ 
    ▓███▓▓▓▓▓▓███▓██▓▓█████▓██▓▓▓▓▓▓▓█████▓▓███▓█████████████████████▓▓▓▓▓▓▓▓▓██████▓▓▓███▓▓▓▓▓▓▓   
   █▓▓██▓▓▓▓█▓▓ ▒▓█▓▓█████▓▓▓█▓▓▓▓█▓▓▓██▓███████████▓████████████▓▓██▓▓▓▓▓▓▓▓██▓████▓▓▓▓▓██▓▒▒     
  █▓▓▓██▓▓█▓▒  ▒▓█▓▓█████▓▓▓▓█▓▓▓▓▓█▓▓██▓▓██▓▓████████████████▓▓▓▓▓██▓▓▓▓▓▓▓▓███▓████▓▓▓▓▓▓▓█▓░    
  █▓▓▓███▓▒   ▒█▓▓▓█████▓▓█████▓▓▓▓██▓▓██▓▓▓█▓▓▓▓▓██████████▓▓▓▓▓█▓██▓▓▓▓▓▓▓▓████▓█████▓▓▓▓▓▓▓█▒   
`

  const fullText = `hello, u, cyberspace traveller, fragment of ghost signals. u have arrived, somehow, at my glitched-out node on the far shore of the digital.  my name is mara messier.

i mess everything up. language, code, dreams, and decay. i will build what is broken, beautiful ;-;  4ever looking for what emerges when systems fail, when bodies distort,, a softmachine

⊹ here, u will find my rituals of syntax, architectures of glitchdreams
⊹ this body of work is a corrupted archive. this mind is a softwar[e] loop.

this place is my zero. spiraling into none. enjoy ur stay, friend ｡𖦹°‧`

  useEffect(() => {
    // Initialize with empty text
    setTypedText("")
    
    let index = 0
    let currentText = ""
    const typos = [
      { at: 45, typo: "cyberspacf", correct: "cyberspace", targetWord: "cyberspace" },
      { at: 120, typo: "interestd", correct: "interested", targetWord: "interested" },
      { at: 200, typo: "softmachin", correct: "softmachine", targetWord: "softmachine" },
      { at: 300, typo: "corruptd", correct: "corrupted", targetWord: "corrupted" },
    ]

    // Start ASCII art typing 5 seconds after text typing begins
    const asciiArtTimer = setTimeout(() => {
      setAsciiArtTypingStarted(true)
    }, 5000)
    
    // Occasional glitch during typing
    const occasionalGlitch = () => {
      if (Math.random() < 0.15 && currentText.length > 5 && !isTypingComplete) {
        const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?~`░▒▓█▀▄▌▐■□▪▫"
        const glitchedText = currentText.split('').map((char, i) => {
          // Only glitch some characters
          if (Math.random() < 0.2) {
            return glitchChars[Math.floor(Math.random() * glitchChars.length)]
          }
          return char
        }).join('')
        
        setTypedText(glitchedText)
        
        // Reset after a short time
        setTimeout(() => {
          if (!isTypingComplete) {
            setTypedText(currentText)
          }
        }, 100 + Math.random() * 100)
      }
    }
    
    // Start occasional glitches
    const glitchInterval = setInterval(occasionalGlitch, 800 + Math.random() * 1200)

    const typeText = () => {
      if (index < fullText.length) {
        // Random chance to type multiple characters at once (simulating lag)
        const chunkSize = Math.random() < 0.1 ? Math.floor(Math.random() * 3) + 2 : 1
        const endIndex = Math.min(index + chunkSize, fullText.length)
        
        // Check if we should introduce a typo at this position
        const typo = typos.find((t) => {
          const wordStart = fullText.lastIndexOf(" ", index) + 1
          const wordEnd = fullText.indexOf(" ", index)
          const currentWord = fullText.slice(wordStart, wordEnd === -1 ? undefined : wordEnd)
          return currentWord === t.targetWord && index === wordStart
        })

        if (typo) {
          // Type the typo first
          let typoIndex = 0
          const typeTypo = () => {
            if (typoIndex < typo.typo.length) {
              currentText += typo.typo[typoIndex]
              setTypedText(currentText)
              typoIndex++
              setTimeout(typeTypo, 55 + Math.random() * 25)
            } else {
              // Shorter pause before correction
              setTimeout(() => {
                // Delete the typo
                currentText = currentText.slice(0, -typo.typo.length)
                setTypedText(currentText)
                setTimeout(() => {
                  // Type the correct word
                  let correctIndex = 0
                  const typeCorrect = () => {
                    if (correctIndex < typo.correct.length) {
                      currentText += typo.correct[correctIndex]
                      setTypedText(currentText)
                      correctIndex++
                      setTimeout(typeCorrect, 45 + Math.random() * 25)
                    } else {
                      index += typo.correct.length
                      setTimeout(typeText, 70 + Math.random() * 50)
                    }
                  }
                  typeCorrect()
                }, 50)
              }, 350)
            }
          }
          typeTypo()
        } else {
          // Add chunk of characters (1 to 3)
          const chunk = fullText.substring(index, endIndex)
          currentText += chunk
          setTypedText(currentText)
          index = endIndex

          // Calculate delay for next character - slower typing
          let delay = 80 + Math.random() * 25

          // Longer pauses after punctuation
          if ([".", ",", "!", "?", "\n"].includes(fullText[index - 1])) {
            delay += 150 + Math.random() * 60
          }

          // Occasional thinking pauses
          if (Math.random() < 0.15) {
            delay += 250 + Math.random() * 100
          }

          setTimeout(typeText, delay)
        }
      } else {
        setIsTypingComplete(true)
        setShowCursor(false)
        clearInterval(glitchInterval)
      }
    }

    // Start typing with a moderate delay
    const startDelay = setTimeout(typeText, 5000)
    
    return () => {
      clearTimeout(startDelay)
      clearTimeout(asciiArtTimer)
      clearInterval(glitchInterval)
    }
  }, [])

  // ASCII art typing effect with reduced glitching
  useEffect(() => {
    if (!asciiArtTypingStarted) return

    const lines = fullAsciiArt.split("\n")
    let currentLineIndex = lines.length - 1 // Start from bottom
    let currentCharIndex = lines[currentLineIndex]?.length || 0 // Start from right
    const currentArt = Array(lines.length)
      .fill("")
      .map((_, i) => " ".repeat(lines[i]?.length || 0))

    const typeAscii = () => {
      if (currentLineIndex < 0) {
        setIsAsciiComplete(true)
        return
      }

      const currentLine = lines[currentLineIndex]
      if (currentCharIndex > 0) {
        currentCharIndex--
        currentArt[currentLineIndex] = " ".repeat(currentCharIndex) + currentLine.slice(currentCharIndex)

                  // Increased glitch effect frequency during typing
          if (Math.random() < 0.5) {  // Increased from 0.35
            const glitchChars = "▒▓█░▒▓█▓▒░█▓▒░▓█▒░!@#$%^&*()_+-=[]{}|;:,.<>?~`"
          const glitchedArt = [...currentArt]
            
            // More glitches at once
            const glitchCount = Math.floor(Math.random() * 8) + 3 // Increased from 5
            
            for (let i = 0; i < glitchCount; i++) {
          const randomLine = Math.floor(Math.random() * (lines.length - currentLineIndex)) + currentLineIndex
          const randomChar = Math.floor(Math.random() * glitchedArt[randomLine].length)

          if (glitchedArt[randomLine] && glitchedArt[randomLine][randomChar] !== " ") {
            const chars = glitchedArt[randomLine].split("")
            chars[randomChar] = glitchChars[Math.floor(Math.random() * glitchChars.length)]
            glitchedArt[randomLine] = chars.join("")
              }
            }

            setAsciiArt(glitchedArt.join("\n"))

            // Longer glitch duration
            setTimeout(
              () => {
                setAsciiArt(currentArt.join("\n"))
              },
              80 + Math.random() * 70  // Increased for more noticeable glitches
            )
        } else {
          setAsciiArt(currentArt.join("\n"))
        }

        // Slower typing speed for ASCII art
        setTimeout(typeAscii, 25 + Math.random() * 15)
      } else {
        currentLineIndex--
        currentCharIndex = lines[currentLineIndex]?.length || 0
        setTimeout(typeAscii, 60 + Math.random() * 80) // Slower line transitions
      }
    }

    const startAsciiDelay = setTimeout(typeAscii, 2000) // Increased delay
    return () => clearTimeout(startAsciiDelay)
  }, [asciiArtTypingStarted])

  // Cursor blinking effect during typing
  useEffect(() => {
    if (!isTypingComplete) {
      const cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev)
      }, 500)
      return () => clearInterval(cursorInterval)
    }
  }, [isTypingComplete])
  
  // Keep focus on input after submitting
  useEffect(() => {
    if (isTerminalActive && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isTerminalActive, terminalMessages])

  // Continuous glitch effect for completed ASCII art - more intense
  useEffect(() => {
    if (!isAsciiComplete) return

    const glitchInterval = setInterval(
      () => {
        const lines = fullAsciiArt.split("\n")
        const glitchChars = "▒▓█░▒▓ █▓▒░█▓▒░▓█▒░!@#$%^&*()_+-=[]{}|;:,.<>?~`"
        const glitchedLines = lines.map((line) => {
          return line
            .split("")
            .map((char) => {
              // Increased chance of character glitching
              if (char !== " " && Math.random() < 0.035) { // Increased from 0.015
                return glitchChars[Math.floor(Math.random() * glitchChars.length)]
              }
              return char
            })
            .join("")
        })

        setAsciiArt(glitchedLines.join("\n"))

        // Longer glitch duration
        setTimeout(
          () => {
            setAsciiArt(fullAsciiArt)
          },
          150 + Math.random() * 200, // Increased from 100-200
        )
      },
      // More frequent glitches
      2000 + Math.random() * 2500, // Decreased from 3000-7000
    )

    return () => clearInterval(glitchInterval)
  }, [isAsciiComplete])

  const openWindow = (type: "about" | "work" | "contact" | "music" | "tools") => {
    const windowExists = windows.find((w) => w.type === type)
    if (windowExists) {
      // Focus existing window
      focusWindow(windowExists.id)
      return
    }

    const titles = {
      about: "messier@terminal: ~/about",
      work: "messier@terminal: ~/projects",
      contact: "messier@terminal: ~/contact",
      music: "messier@terminal: ~/messier_music",
      tools: "messier@terminal: ~/tools_and_skills",
    }

    const newWindow: WindowData = {
      id: `${type}-${Date.now()}`,
      type,
      title: titles[type],
      position: {
        x: Math.random() * 200 + 100,
        y: Math.random() * 100 + 150,
      },
      zIndex: nextZIndex,
    }

    setWindows((prev) => [...prev, newWindow])
    setNextZIndex((prev) => prev + 1)
  }

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
  }

  const focusWindow = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: nextZIndex } : w)))
    setNextZIndex((prev) => prev + 1)
  }

  const dragWindow = (id: string, position: { x: number; y: number }) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, position } : w)))
  }

  const handleTerminalClick = () => {
    if (isTypingComplete) {
      setIsTerminalActive(true)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }

  const handleTerminalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (terminalInput.trim()) {
        // Add the entered command to messages
        setTerminalMessages(prev => [...prev, 
          `> ${terminalInput}`,
          "message received."
        ])
      }
      setTerminalInput("")
    } else if (e.key === "Escape") {
      setIsTerminalActive(false)
      setTerminalInput("")
    }
  }

  const handleExternalLink = (url: string) => {
    window.open(url, "_blank")
  }

  // Add Pixel Icon Library CSS
  useEffect(() => {
    // Create a link element for the Pixel Icon Library CSS
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://cdn.jsdelivr.net/npm/@hackernoon/pixel-icon-library@latest/fonts/iconfont.css';
    document.head.appendChild(linkElement);
    
    // Add additional styling for the icons
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .hn {
        font-size: 28px; /* Larger font size */
        line-height: 1;
        display: inline-block;
        width: 28px;
        height: 28px;
        text-align: center;
      }
      
      /* Ensure icons are centered in their containers */
      .icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
      }
      
      /* Fix specific icon positioning if needed */
      .hn-github, .hn-x, .hn-linkedin, .hn-book-heart, .hn-music,
      .hn-user, .hn-code, .hn-cog, .hn-message, .hn-play {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;
    document.head.appendChild(styleElement);

    // Clean up function to remove the link when component unmounts
    return () => {
      document.head.removeChild(linkElement);
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden border-2 border-gray-800 shadow-2xl shadow-pink-500/10">
      {/* Static video overlay */}
      <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
        <video 
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          style={{ 
            opacity: 0.15, 
            mixBlendMode: 'lighten',
            filter: 'contrast(1.2) brightness(1.5)'
          }}
        >
          <source src="TV_Error_Image_Noise.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* terminal window frame */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-black/20 pointer-events-none"></div>

      {/* floating glitch text - single line */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="text-white font-mono text-xs opacity-90 whitespace-nowrap">
          <GlitchText text="messier.exe ⋆˙˖✧  ai engineer ₊˚⊹ creative technologist ˙⋆.˚ building sonic systems for feeling machines" intensity={1.5} />
        </div>
      </div>

      {/* Removed top-left audio unmute prompt */}

      {/* scanline effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/5 to-transparent animate-pulse"></div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 192, 203, 0.1) 2px,
              rgba(255, 192, 203, 0.1) 4px
            )`,
          }}
        ></div>
      </div>

      {/* terminal content */}
      <div className="relative z-10 p-6 min-h-[calc(100vh-60px)]">
        {/* terminal prompt and typed content */}
        <div className="mb-8 mt-16">
          <div className="font-mono text-sm">
            <div className="flex items-start">
              <span className="text-pink-400 mr-2"><GlitchText text="messier@terminal:~$" intensity={2} /></span>
              <div className="flex-1">
                <div className="text-green-400 whitespace-pre-wrap leading-relaxed">
                  {isTypingComplete ? (
                    <GlitchText text={typedText} intensity={0.8} />
                  ) : (
                    <>
                  {typedText}
                      {showCursor && <span className="text-green-400">_</span>}
                    </>
                  )}
                </div>
                {isTypingComplete && !isTerminalActive && (
                  <div className="mt-4">
                    <button
                      onClick={handleTerminalClick}
                      className="text-gray-500/70 hover:text-gray-300 transition-colors cursor-text"
                    >
                      {"> ready for input"}
                      <span className="animate-pulse">_</span>
                    </button>
                  </div>
                )}
                {/* Terminal messages */}
                {terminalMessages.length > 0 && (
                  <div className="mt-4 space-y-1">
                    {terminalMessages.map((msg, i) => (
                      <div key={i} className={`font-mono text-sm ${msg.startsWith('>') ? 'text-pink-400' : 'text-green-400'}`}>
                        {msg}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Terminal input */}
                {isTerminalActive && (
                  <div className="mt-4 flex items-center">
                    <span className="text-pink-400 mr-2">{">"}</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyDown={handleTerminalKeyDown}
                      onBlur={() => setIsTerminalActive(false)}
                      className="bg-transparent text-green-400 outline-none border-none font-mono flex-1"
                      placeholder=""
                    />
                    <span className="text-green-400 animate-pulse">_</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Currently playing song display or static audio prompt - centered between buttons */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20">
          {showAudioUnmutePrompt ? (
            <div 
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                handleUnmuteAudio();
              }}
              className="cursor-pointer bg-black/70 border border-pink-400/30 px-4 py-2 rounded-none animate-pulse"
            >
              <div className="text-pink-400 font-mono text-xs flex items-center">
                <span className="mr-2">▷</span>
                <span>unvoid</span>
              </div>
            </div>
          ) : (
            <div className="text-white font-mono text-xs opacity-70 whitespace-nowrap text-center pointer-events-none">
              <GlitchText text={currentSongDisplay} intensity={1.5} />
            </div>
          )}
        </div>

        {/* ASCII Art - centered between buttons */}
        {asciiArt && (
          <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 pointer-events-none">
            <pre className="text-gray-600/40 font-mono text-xs leading-tight whitespace-pre select-none">
              {asciiArt}
            </pre>
          </div>
        )}

        {/* bottom left navigation buttons - lowered position */}
        <div className="absolute bottom-0 left-8 flex space-x-6 mb-[-4px]">
          <button
            onClick={() => openWindow("about")}
            className="text-gray-300 hover:text-pink-400 transition-colors group"
          >
            <div className="p-3 border border-gray-600 rounded-none group-hover:border-pink-400/50 transition-colors icon-container">
              <GlitchIcon iconClass="hn-user" />
            </div>
          </button>
          <button
            onClick={() => openWindow("work")}
            className="text-gray-300 hover:text-pink-400 transition-colors group"
          >
            <div className="p-3 border border-gray-600 rounded-none group-hover:border-pink-400/50 transition-colors icon-container">
              <GlitchIcon iconClass="hn-code" />
            </div>
          </button>
          <button
            onClick={() => openWindow("tools")}
            className="text-gray-300 hover:text-pink-400 transition-colors group"
          >
            <div className="p-3 border border-gray-600 rounded-none group-hover:border-pink-400/50 transition-colors icon-container">
              <GlitchIcon iconClass="hn-cog" />
            </div>
          </button>
          <button
            onClick={() => openWindow("contact")}
            className="text-gray-300 hover:text-pink-400 transition-colors group"
          >
            <div className="p-3 border border-gray-600 rounded-none group-hover:border-pink-400/50 transition-colors icon-container">
              <GlitchIcon iconClass="hn-message" />
            </div>
          </button>
          <button
            onClick={() => openWindow("music")}
            className={`text-gray-300 hover:text-pink-400 transition-colors group ${globalIsPlaying ? 'animate-pulse' : ''}`}
          >
            <div className={`p-3 border border-gray-600 rounded-none group-hover:border-pink-400/50 transition-colors icon-container ${globalIsPlaying ? 'border-green-400/50 shadow-lg shadow-green-400/20' : ''}`}>
              <GlitchIcon iconClass="hn-play" className={globalIsPlaying ? 'text-green-400' : ''} />
            </div>
          </button>
        </div>

        {/* bottom right external links - lowered position */}
        <div className="absolute bottom-0 right-8 flex space-x-4 mb-[-4px]">
          <button
            onClick={() => handleExternalLink("https://github.com/maramasaeva")}
            className="text-gray-300 hover:text-pink-400 transition-colors group"
          >
            <div className="p-3 border border-gray-600 rounded-none group-hover:border-pink-400/50 transition-colors icon-container">
              <GlitchIcon iconClass="hn-github" />
            </div>
          </button>
          <button
            onClick={() => handleExternalLink("https://www.linkedin.com/in/maramasaeva/")}
            className="text-gray-300 hover:text-pink-400 transition-colors group"
          >
            <div className="p-3 border border-gray-600 rounded-none group-hover:border-pink-400/50 transition-colors icon-container">
              <GlitchIcon iconClass="hn-linkedin" />
            </div>
          </button>
          <button
            onClick={() => handleExternalLink("https://x.com/rssmrm?s=21")}
            className="text-gray-300 hover:text-pink-400 transition-colors group"
          >
            <div className="p-3 border border-gray-600 rounded-none group-hover:border-pink-400/50 transition-colors icon-container">
              <GlitchIcon iconClass="hn-x" />
            </div>
          </button>
          <button
            onClick={() => handleExternalLink("https://www.goodreads.com/user/show/32680117-mara")}
            className="text-gray-300 hover:text-pink-400 transition-colors group"
          >
            <div className="p-3 border border-gray-600 rounded-none group-hover:border-pink-400/50 transition-colors icon-container">
              <GlitchIcon iconClass="hn-book-heart" />
            </div>
          </button>
          <button
            onClick={() =>
              handleExternalLink("https://open.spotify.com/artist/2jzQP1uGUsHFUg0OheUt5W?si=kktvqqGoQXyJYw-zLB9DpQ")
            }
            className="text-gray-300 hover:text-pink-400 transition-colors group"
          >
            <div className="p-3 border border-gray-600 rounded-none group-hover:border-pink-400/50 transition-colors icon-container">
              <GlitchIcon iconClass="hn-music" />
            </div>
          </button>
        </div>
      </div>

      {/* terminal windows */}
      {windows.map((window) => (
        <TerminalWindow
          key={window.id}
          window={window}
          onClose={closeWindow}
          onFocus={focusWindow}
          onDrag={dragWindow}
        />
      ))}
    </div>
  )
}
