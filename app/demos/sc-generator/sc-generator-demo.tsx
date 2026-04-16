"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { EmotionResult, MotionData } from "@/types/sc-generator"

type Stage = "idle" | "analyzing" | "matching" | "generating" | "complete"

export default function ScGeneratorDemo() {
  const [text, setText] = useState("")
  const [stage, setStage] = useState<Stage>("idle")
  const [emotions, setEmotions] = useState<EmotionResult[]>([])
  const [code, setCode] = useState("")
  const [displayedCode, setDisplayedCode] = useState("")
  const [caption, setCaption] = useState("")
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [motionData, setMotionData] = useState<MotionData | null>(null)

  const synthRef = useRef<{ stop: () => void; updateMotion: (d: MotionData) => void } | null>(null)
  const motionRef = useRef<{ stop: () => void } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Initialize camera on mount
  useEffect(() => {
    let mounted = true

    async function initCamera() {
      if (!videoRef.current) return
      try {
        const { createMotionTracker } = await import("@/lib/sc-motion")
        const tracker = await createMotionTracker()
        await tracker.start(videoRef.current)
        if (!mounted) {
          tracker.stop()
          return
        }
        motionRef.current = tracker

        tracker.onFrame((data) => {
          setMotionData(data)
          synthRef.current?.updateMotion(data)
        })

        setCameraActive(true)
      } catch {
        if (mounted) setCameraError(true)
      }
    }

    initCamera()
    return () => {
      mounted = false
      motionRef.current?.stop()
    }
  }, [])

  // Code typewriter effect
  useEffect(() => {
    if (stage !== "generating" || !code) return
    let i = 0
    setDisplayedCode("")
    const interval = setInterval(() => {
      if (i >= code.length) {
        clearInterval(interval)
        setStage("complete")
        return
      }
      const chunk = code.slice(i, i + 4)
      i += 4
      setDisplayedCode((prev) => prev + chunk)
    }, 12)
    return () => clearInterval(interval)
  }, [stage, code])

  // Start audio when code typewriter completes
  useEffect(() => {
    if (stage !== "complete" || emotions.length === 0 || isPlaying) return

    async function startAudio() {
      const { playSynthesis } = await import("@/lib/sc-synth")
      const result = playSynthesis(emotions, (data) => {
        setWaveformData(data.slice(0, 64))
      })
      synthRef.current = result
      setIsPlaying(true)
    }

    startAudio()
  }, [stage, emotions, isPlaying])

  const handleStop = useCallback(() => {
    synthRef.current?.stop()
    synthRef.current = null
    setIsPlaying(false)
    setWaveformData([])
  }, [])

  const handleGenerate = async () => {
    if (!text.trim()) return

    // Stop previous audio
    handleStop()

    setStage("analyzing")
    setEmotions([])
    setCode("")
    setDisplayedCode("")
    setCaption("")
    setWaveformData([])
    setError(null)

    try {
      const res = await fetch("/api/sc/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poem: text }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const data = await res.json()

      // Show emotions
      setEmotions(data.emotions || [])
      setCaption(data.caption || "")
      setStage("matching")

      // Brief visual pause
      await new Promise((r) => setTimeout(r, 800))

      // Start code typewriter (triggers "generating" → "complete" → audio)
      setCode(data.scCode || "")
      setStage("generating")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setStage("idle")
    }
  }

  const examplePoems = [
    "fire burns through the static, a glitch in the machine of my heart, love dissolving into noise",
    "quiet ocean waves carry my dreams far from shore, drifting through clouds of soft light",
    "i remember your ghost in every shadow, longing echoes through empty rooms of memory",
    "rage and chaos scatter like fragments of broken code, the system crashes beautifully",
  ]

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a08",
        color: "#ddddd8",
        fontFamily: "'DM Mono', 'Courier New', monospace",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .cursor { display: inline-block; animation: blink 1s step-end infinite; }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        .analyzing-pulse { animation: pulse-glow 0.8s ease-in-out infinite; }
        @keyframes slide-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .slide-in { animation: slide-in 0.4s ease forwards; }
        textarea:focus { outline: none; border-color: #c8f060 !important; }
        textarea::placeholder { color: #333330; }
      `}</style>

      {/* Camera inset — top right */}
      <div
        style={{
          position: "fixed",
          top: "1rem",
          right: "2rem",
          width: "240px",
          height: "180px",
          border: `0.5px solid ${cameraActive ? "#c8f06040" : "#222220"}`,
          background: "#111110",
          zIndex: 50,
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)",
            opacity: cameraActive ? 1 : 0,
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
        {cameraActive && (
          <div
            style={{
              position: "absolute",
              bottom: "4px",
              left: "4px",
              fontSize: "9px",
              color: "#c8f060",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "#0a0a08cc",
              padding: "2px 4px",
            }}
          >
            tracking
          </div>
        )}
        {!cameraActive && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: "8px" }}>
            <span style={{ fontSize: "9px", color: "#555550", textAlign: "center", lineHeight: 1.5 }}>
              {cameraError ? "camera unavailable — audio still works" : "requesting camera..."}
            </span>
          </div>
        )}
      </div>

      {/* Motion data overlay */}
      {cameraActive && motionData && (
        <div
          style={{
            position: "fixed",
            top: "calc(180px + 1.5rem)",
            right: "2rem",
            width: "240px",
            fontSize: "9px",
            color: "#555550",
            zIndex: 50,
            fontFamily: "'DM Mono', monospace",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>motion</span>
            <span style={{ color: "#c8f060" }}>{(motionData.movementIntensity * 100).toFixed(0)}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>height</span>
            <span style={{ color: "#60c8f0" }}>{(motionData.verticalPosition * 100).toFixed(0)}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>pan</span>
            <span style={{ color: "#f060a0" }}>{motionData.horizontalPosition.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>spread</span>
            <span style={{ color: "#a060f0" }}>{(motionData.spread * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* nav */}
      <nav style={{ borderBottom: "0.5px solid #222220", padding: "1.25rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/demos" style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "#c8f060", textDecoration: "none" }}>
          ← demos
        </a>
        <a href="https://github.com/maramasaeva/sc_generator" target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#555550", textDecoration: "none" }}>
          github →
        </a>
      </nav>

      {/* header */}
      <section style={{ padding: "3rem 2rem 2rem", maxWidth: "900px" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#555550", marginBottom: "1rem" }}>
          messier@terminal:~/demos/sc_generator$
        </p>
        <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 400, lineHeight: 1.2, color: "#f0f0ea" }}>
          sc_generator<span className="cursor" style={{ color: "#c8f060", marginLeft: "4px" }}>_</span>
        </h1>
        <p style={{ marginTop: "0.75rem", fontSize: "0.95rem", lineHeight: 1.8, color: "#888880", maxWidth: "600px" }}>
          type a poem. gpt-4o-mini analyzes its emotional content and generates supercollider code. web audio synthesizes the sound in your browser. your body shapes it.
        </p>
      </section>

      <hr style={{ border: "none", borderTop: "0.5px solid #222220", margin: 0 }} />

      {/* input */}
      <section style={{ maxWidth: "900px", padding: "2rem" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#555550", marginBottom: "1rem" }}>
          input poem
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="type or paste a poem here..."
          rows={4}
          style={{
            width: "100%",
            background: "#111110",
            border: "0.5px solid #222220",
            color: "#ddddd8",
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.9rem",
            lineHeight: 1.8,
            padding: "1rem",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <button
            onClick={handleGenerate}
            disabled={!text.trim() || (stage !== "idle" && stage !== "complete")}
            style={{
              background: text.trim() ? "#c8f060" : "#222220",
              color: text.trim() ? "#0a0a08" : "#555550",
              border: "none",
              padding: "8px 20px",
              fontFamily: "'DM Mono', monospace",
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              cursor: text.trim() ? "pointer" : "default",
            }}
          >
            {stage === "idle" || stage === "complete" ? "generate" : "analyzing with ai..."}
          </button>
          {isPlaying && (
            <button
              onClick={handleStop}
              style={{
                background: "none",
                border: "0.5px solid #f06060",
                color: "#f06060",
                padding: "8px 16px",
                fontFamily: "'DM Mono', monospace",
                fontSize: "12px",
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                cursor: "pointer",
              }}
            >
              stop
            </button>
          )}
          <span style={{ fontSize: "11px", color: "#555550" }}>or try:</span>
          {examplePoems.map((poem, i) => (
            <button
              key={i}
              onClick={() => setText(poem)}
              style={{
                background: "none",
                border: "0.5px solid #222220",
                color: "#555550",
                padding: "4px 8px",
                fontFamily: "'DM Mono', monospace",
                fontSize: "10px",
                cursor: "pointer",
              }}
            >
              example {i + 1}
            </button>
          ))}
        </div>
        {error && (
          <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#f06060" }}>
            error: {error}
          </p>
        )}
      </section>

      {/* pipeline stages */}
      {stage !== "idle" && (
        <>
          <hr style={{ border: "none", borderTop: "0.5px solid #222220", margin: 0 }} />

          {/* emotion analysis */}
          <section style={{ maxWidth: "900px", padding: "2rem" }} className="slide-in">
            <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#555550", marginBottom: "1rem" }}>
              <span className={stage === "analyzing" ? "analyzing-pulse" : ""}>
                01 — emotional analysis
              </span>
              {stage !== "analyzing" && <span style={{ color: "#c8f060", marginLeft: "8px" }}>done</span>}
            </p>

            {emotions.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {emotions.map((e) => (
                  <div key={e.emotion} className="slide-in" style={{ minWidth: "120px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: e.color, display: "inline-block" }} />
                      <span style={{ fontSize: "0.9rem", color: e.color }}>{e.emotion}</span>
                      <span style={{ fontSize: "11px", color: "#555550" }}>{(e.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div style={{ width: "100%", height: "2px", background: "#222220" }}>
                      <div style={{ width: `${e.confidence * 100}%`, height: "100%", background: e.color, transition: "width 0.5s ease" }} />
                    </div>
                    {e.keywords.length > 0 && (
                      <div style={{ marginTop: "4px", fontSize: "10px", color: "#555550" }}>
                        {e.keywords.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* synth matching */}
          {(stage === "matching" || stage === "generating" || stage === "complete") && (
            <>
              <hr style={{ border: "none", borderTop: "0.5px solid #222220", margin: 0 }} />
              <section style={{ maxWidth: "900px", padding: "2rem" }} className="slide-in">
                <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#555550", marginBottom: "1rem" }}>
                  <span className={stage === "matching" ? "analyzing-pulse" : ""}>
                    02 — synth mapping
                  </span>
                  {stage !== "matching" && <span style={{ color: "#c8f060", marginLeft: "8px" }}>done</span>}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {emotions.map((e) => (
                    <div
                      key={e.emotion}
                      className="slide-in"
                      style={{ border: `0.5px solid ${e.color}33`, padding: "8px 12px", fontSize: "11px" }}
                    >
                      <span style={{ color: e.color }}>{e.emotion}</span>
                      <span style={{ color: "#555550" }}> → </span>
                      <span style={{ color: "#ddddd8" }}>{e.synthParams.waveform}</span>
                      <span style={{ color: "#555550" }}> @ </span>
                      <span style={{ color: "#888880" }}>{e.synthParams.frequency}hz</span>
                      <span style={{ color: "#555550" }}> / </span>
                      <span style={{ color: "#888880" }}>lpf {e.synthParams.filterFreq}hz</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* generated code */}
          {(stage === "generating" || stage === "complete") && (
            <>
              <hr style={{ border: "none", borderTop: "0.5px solid #222220", margin: 0 }} />
              <section style={{ maxWidth: "900px", padding: "2rem" }} className="slide-in">
                <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#555550", marginBottom: "0.5rem" }}>
                  03 — supercollider output
                  {stage === "complete" && <span style={{ color: "#c8f060", marginLeft: "8px" }}>done</span>}
                </p>
                {caption && (
                  <p style={{ fontSize: "0.8rem", color: "#888880", marginBottom: "1rem", fontStyle: "italic" }}>
                    {caption}
                  </p>
                )}
                <pre
                  style={{
                    background: "#111110",
                    border: "0.5px solid #222220",
                    padding: "1.5rem",
                    fontSize: "12px",
                    lineHeight: 1.7,
                    overflowX: "auto",
                    color: "#c8f060",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {displayedCode}
                  {stage === "generating" && <span className="cursor" style={{ color: "#c8f060" }}>_</span>}
                </pre>
              </section>
            </>
          )}

          {/* waveform + audio */}
          {stage === "complete" && (
            <>
              <hr style={{ border: "none", borderTop: "0.5px solid #222220", margin: 0 }} />
              <section style={{ maxWidth: "900px", padding: "2rem" }} className="slide-in">
                <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#555550", marginBottom: "1rem" }}>
                  04 — web audio synthesis
                  {isPlaying && <span style={{ color: "#c8f060", marginLeft: "8px" }}>playing</span>}
                  {cameraActive && isPlaying && <span style={{ color: "#a060f0", marginLeft: "8px" }}>+ body modulation</span>}
                </p>
                {waveformData.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", height: "80px", gap: "2px" }}>
                    {waveformData.map((val, i) => {
                      const h = Math.abs(val) * 70 + 2
                      const color = emotions[0]?.color || "#c8f060"
                      return (
                        <div
                          key={i}
                          style={{
                            width: "100%",
                            height: `${h}px`,
                            background: color,
                            opacity: 0.3 + Math.abs(val) * 0.7,
                            transition: "height 0.05s ease",
                          }}
                        />
                      )
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </>
      )}

      {/* footer */}
      <section style={{ padding: "2rem 2rem 4rem", maxWidth: "900px" }}>
        <hr style={{ border: "none", borderTop: "0.5px solid #222220", margin: "0 0 2rem 0" }} />
        <p style={{ fontSize: "0.8rem", lineHeight: 1.8, color: "#555550", maxWidth: "560px" }}>
          powered by gpt-4o-mini for emotional analysis and supercollider code generation, web audio api for browser-based synthesis, and mediapipe for real-time hand tracking. move your hands to shape the sound — height controls brightness, position controls pan, spread controls reverb.
        </p>
        <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", lineHeight: 1.8, color: "#555550" }}>
          based on{" "}
          <a href="https://github.com/maramasaeva/sc_generator" target="_blank" rel="noopener noreferrer" style={{ color: "#888880", textDecoration: "none", borderBottom: "0.5px solid #333330" }}>
            sc_generator
          </a>
          {" "}+{" "}
          <a href="https://github.com/maramasaeva/codance" target="_blank" rel="noopener noreferrer" style={{ color: "#888880", textDecoration: "none", borderBottom: "0.5px solid #333330" }}>
            codance
          </a>
          .
        </p>
        <p style={{ marginTop: "1.5rem", fontSize: "11px", color: "#555550", letterSpacing: "0.08em" }}>
          messier@terminal:~/demos/sc_generator$ <span style={{ color: "#c8f060" }}>_</span>
        </p>
      </section>
    </main>
  )
}
