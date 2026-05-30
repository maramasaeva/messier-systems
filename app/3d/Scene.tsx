"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, OrbitControls, AdaptiveDpr } from "@react-three/drei"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import FloatingScreen from "./FloatingScreen"
import SecondaryTablet from "./SecondaryTablet"
import DigitalVoid from "./DigitalVoid"
import MessierSky from "./MessierSky"
import Effects from "./Effects"
import type { LaunchableWindow, Tablet } from "./tablets"

// place a newly opened tablet beside the main one, slightly in FRONT of it
// (positive z = toward the camera) so it can never end up hidden behind it
function spawnPosition(index: number): [number, number, number] {
  const slots: [number, number, number][] = [
    [3.5, 0.2, 0.5], // right
    [-3.5, 0.2, 0.5], // left
    [3.7, -1.5, 0.7], // lower right
    [-3.7, -1.5, 0.7], // lower left
    [3.9, 1.8, 0.7], // upper right
    [-3.9, 1.8, 0.7], // upper left
  ]
  if (index < slots.length) return slots[index]
  const side = index % 2 === 0 ? 1 : -1
  const tier = Math.floor(index / 2)
  return [side * (3.5 + tier * 0.5), 0.2, 0.5 + tier * 0.4]
}

// WASD / arrow keys fly the camera through the void (pans camera + target together)
function KeyboardMove() {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as unknown as
    | { target: THREE.Vector3; update: () => void }
    | undefined
  const keys = useRef<Record<string, boolean>>({})

  useEffect(() => {
    const isEditable = () => {
      const a = document.activeElement as HTMLElement | null
      return !!a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable)
    }
    const MOVE = new Set([
      "KeyW", "KeyA", "KeyS", "KeyD",
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    ])
    const down = (e: KeyboardEvent) => {
      if (!MOVE.has(e.code) || isEditable()) return
      e.preventDefault()
      keys.current[e.code] = true
    }
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [])

  useFrame((_, dt) => {
    const k = keys.current
    const forward = camera.getWorldDirection(new THREE.Vector3())
    forward.y = 0
    if (forward.lengthSq() === 0) return
    forward.normalize()
    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize()

    const move = new THREE.Vector3()
    if (k.KeyW || k.ArrowUp) move.add(forward)
    if (k.KeyS || k.ArrowDown) move.sub(forward)
    if (k.KeyD || k.ArrowRight) move.add(right)
    if (k.KeyA || k.ArrowLeft) move.sub(right)
    if (move.lengthSq() === 0) return

    move.normalize().multiplyScalar(Math.min(dt, 0.05) * 4.5)
    camera.position.add(move)
    if (controls?.target) {
      controls.target.add(move)
      controls.update()
    }
  })

  return null
}

export default function Scene() {
  const [tablets, setTablets] = useState<Tablet[]>([])
  const nextId = useRef(1)

  const launch = useCallback((t: Omit<Tablet, "id" | "position">) => {
    setTablets((prev) => {
      if (prev.some((p) => p.kind === t.kind && p.key === t.key)) return prev
      return [...prev, { ...t, id: nextId.current++, position: spawnPosition(prev.length) }]
    })
  }, [])

  const onOpenWindow = useCallback(
    (type: LaunchableWindow) =>
      launch({ kind: "window", key: type, label: type, size: "medium" }),
    [launch]
  )
  const onNavigate = useCallback(
    (href: string, label: string) =>
      launch({ kind: "route", key: href, label, size: "large" }),
    [launch]
  )

  const removeTablet = useCallback(
    (id: number) => setTablets((prev) => prev.filter((p) => p.id !== id)),
    []
  )
  const moveTablet = useCallback(
    (id: number, position: [number, number, number]) =>
      setTablets((prev) => prev.map((p) => (p.id === id ? { ...p, position } : p))),
    []
  )

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0.1, 4.2], fov: 38, near: 0.1, far: 300 }}
    >
      <AdaptiveDpr pixelated />

      {/* pale, dead, overcast digital void */}
      <color attach="background" args={["#c6cbd3"]} />
      <fog attach="fog" args={["#cdd2da", 6, 42]} />

      {/* flat, even overcast light — soft and low-contrast */}
      <ambientLight intensity={0.85} color="#eef1f6" />
      <hemisphereLight intensity={0.7} color="#eef2f8" groundColor="#aeb4bf" />
      <directionalLight position={[6, 12, 4]} intensity={0.45} color="#ffffff" />

      <Suspense fallback={null}>
        <FloatingScreen onOpenWindow={onOpenWindow} onNavigate={onNavigate} />

        {tablets.map((t) => (
          <SecondaryTablet
            key={t.id}
            tablet={t}
            onClose={removeTablet}
            onMove={moveTablet}
          />
        ))}

        <DigitalVoid />
        <MessierSky />

        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.07}
          rotateSpeed={0.5}
          zoomSpeed={2.4}
          minDistance={2.3}
          maxDistance={30}
          minPolarAngle={0.25}
          maxPolarAngle={1.92}
          target={[0, 0, 0.1]}
        />

        {/* soft reflections for the glass */}
        <Environment preset="city" environmentIntensity={0.5} />

        <KeyboardMove />
      </Suspense>

      <Effects />
    </Canvas>
  )
}
