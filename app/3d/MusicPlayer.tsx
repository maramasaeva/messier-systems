"use client"

import Script from "next/script"
import { useCallback, useEffect, useRef, useState } from "react"

/* messier — music. A flat HUD pill in the bottom-right corner (mirrors .ws-exit /
   .ws-recenter) that drives a hidden SoundCloud iframe via the Widget API. Click
   the pill to open a small library and pick a song; the pill shows what's playing.
   Tracks stream straight from SoundCloud — nothing is hosted here. */

type Track = { title: string; album: string; url: string }

// Curated selection across both messier albums (feigur isn't on SoundCloud).
const TRACKS: Track[] = [
  { title: "spinel", album: "perseverance", url: "https://soundcloud.com/user-587494783/spinel-2" },
  { title: "pain i", album: "perseverance", url: "https://soundcloud.com/user-587494783/pain-i-4" },
  { title: "nu", album: "perseverance", url: "https://soundcloud.com/user-587494783/nu-7" },
  { title: "n-JOY", album: "perseverance", url: "https://soundcloud.com/user-587494783/n-joy-9" },
  { title: "return to the necrospace", album: "circuitries", url: "https://soundcloud.com/user-587494783/return-to-the-necrospace-1" },
  { title: "multitudes", album: "circuitries", url: "https://soundcloud.com/user-587494783/multitudes-2" },
  { title: "0", album: "circuitries", url: "https://soundcloud.com/user-587494783/0x-6" },
  { title: "ecsane", album: "circuitries", url: "https://soundcloud.com/user-587494783/ecsane-7" },
]

const ALBUMS = ["perseverance", "circuitries"] as const

// The Widget API has no official types — keep a minimal surface.
type SCWidget = {
  bind: (event: string, listener: (...args: unknown[]) => void) => void
  load: (url: string, opts?: Record<string, unknown>) => void
  play: () => void
  pause: () => void
  toggle: () => void
}
declare global {
  interface Window {
    SC?: {
      Widget: ((el: HTMLIFrameElement) => SCWidget) & {
        Events: { READY: string; PLAY: string; PAUSE: string; FINISH: string }
      }
    }
  }
}

const FIRST_SRC =
  "https://w.soundcloud.com/player/?url=" +
  encodeURIComponent(TRACKS[0].url) +
  "&visual=false&auto_play=false&buying=false&sharing=false&download=false&show_artwork=false"

export default function MusicPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<SCWidget | null>(null)
  const indexRef = useRef(0)
  const autoStartedRef = useRef(false)

  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const playTrack = useCallback((i: number) => {
    const w = widgetRef.current
    if (!w) return
    indexRef.current = i
    setCurrentIndex(i)
    autoStartedRef.current = true
    w.load(TRACKS[i].url, { auto_play: true })
  }, [])

  const initWidget = useCallback(() => {
    const SC = window.SC
    const el = iframeRef.current
    if (!SC || !el || widgetRef.current) return

    const widget = SC.Widget(el)
    widgetRef.current = widget
    const { READY, PLAY, PAUSE, FINISH } = SC.Widget.Events

    widget.bind(READY, () => {
      // Attempt autoplay; browsers usually block it, so also start on the
      // visitor's first interaction with the page (the 3D scene needs one anyway).
      widget.play()
      const startOnGesture = () => {
        if (!autoStartedRef.current) {
          autoStartedRef.current = true
          widget.play()
        }
        window.removeEventListener("pointerdown", startOnGesture)
        window.removeEventListener("keydown", startOnGesture)
      }
      window.addEventListener("pointerdown", startOnGesture)
      window.addEventListener("keydown", startOnGesture)
    })

    widget.bind(PLAY, () => {
      autoStartedRef.current = true
      setIsPlaying(true)
    })
    widget.bind(PAUSE, () => setIsPlaying(false))
    widget.bind(FINISH, () => {
      const next = (indexRef.current + 1) % TRACKS.length
      playTrack(next)
    })
  }, [playTrack])

  // If the API script was already cached/loaded before this mounted, init now.
  useEffect(() => {
    if (window.SC) initWidget()
  }, [initWidget])

  const current = TRACKS[currentIndex]

  return (
    <>
      <Script
        src="https://w.soundcloud.com/player/api.js"
        strategy="afterInteractive"
        onLoad={initWidget}
      />
      <iframe
        ref={iframeRef}
        className="ws-music__frame"
        src={FIRST_SRC}
        allow="autoplay"
        title="messier music player"
      />

      <div className="ws-music" data-open={isOpen}>
        {isOpen && (
          <div className="ws-music__menu" role="menu">
            <div className="ws-music__menu-head">
              <span>messier — library</span>
              <button
                className="ws-music__toggle"
                onClick={() => widgetRef.current?.toggle()}
                aria-label={isPlaying ? "pause" : "play"}
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>
            </div>
            {ALBUMS.map((album) => (
              <div key={album} className="ws-music__group">
                <div className="ws-music__album">{album}</div>
                {TRACKS.map((t, i) =>
                  t.album === album ? (
                    <button
                      key={t.url}
                      className="ws-music__track"
                      data-active={i === currentIndex}
                      onClick={() => playTrack(i)}
                    >
                      {t.title}
                    </button>
                  ) : null,
                )}
              </div>
            ))}
          </div>
        )}

        <button
          className="ws-music__pill"
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
        >
          <span className="ws-music__icon">{isPlaying ? "♫" : "♪"}</span>
          <span className="ws-music__title">
            {isPlaying || autoStartedRef.current ? current.title : "messier — music"}
          </span>
        </button>
      </div>
    </>
  )
}
