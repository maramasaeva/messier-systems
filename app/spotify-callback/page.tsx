"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { handleCallback } from '../../utils/spotifyAuth'

export default function SpotifyCallback() {
  const router = useRouter()

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash) {
        // Convert hash to URLSearchParams by removing the leading # character
        const hashParams = new URLSearchParams(hash.substring(1))
        
        // Handle the callback asynchronously
        handleCallback(hashParams).then(accessToken => {
          if (accessToken) {
            localStorage.setItem('spotify_access_token', accessToken)
            console.log('Access token saved:', accessToken)
          }
          
          // Redirect back to the main page
          router.push('/')
        })
      } else {
        // No hash, redirect back to the main page
        router.push('/')
      }
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center">
        <h1 className="text-2xl font-mono text-pink-400">Authenticating with Spotify...</h1>
        <p className="mt-4 text-gray-400">You will be redirected shortly.</p>
      </div>
    </div>
  )
} 