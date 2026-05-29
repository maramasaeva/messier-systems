"use client"

import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls, AdaptiveDpr } from "@react-three/drei"
import { Suspense, useCallback, useRef, useState } from "react"
import * as THREE from "three"
import FloatingScreen from "./FloatingScreen"
import SecondaryTablet from "./SecondaryTablet"
import DigitalVoid from "./DigitalVoid"
import MessierSky from "./MessierSky"
import Effects from "./Effects"
import type { LaunchableWindow, Tablet } from "./tablets"

// place a newly opened tablet out beside the main one
function spawnPosition(index: number): [number, number, number] {
  const side = index % 2 === 0 ? 1 : -1
  const tier = Math.floor(index / 2)
  return [side * (3.8 + tier * 0.9), 0.3 - tier * 0.4, -0.4 - tier * 0.7]
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
      </Suspense>

      <Effects />
    </Canvas>
  )
}
