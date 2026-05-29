"use client"

import { RoundedBox, Html, Edges } from "@react-three/drei"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import ScreenApp from "./ScreenApp"
import type { LaunchableWindow } from "./tablets"

// 16:10 glass tablet. Homepage DOM authored at this px size, scaled to fit.
// C ≈ 0.02537 world-units per (px · scale): scale = GLASS_W / (DOM_W * C)
const DOM_W = 1440
const DOM_H = 900
const GLASS_W = 4.1
const GLASS_H = 2.56
const DOM_SCALE = GLASS_W / (DOM_W * 0.02537) // fills the glass

export default function FloatingScreen({
  onOpenWindow,
  onNavigate,
}: {
  onOpenWindow?: (type: LaunchableWindow) => void
  onNavigate?: (href: string, label: string) => void
}) {
  const group = useRef<THREE.Group>(null!)

  // slow, weightless hover
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (group.current) {
      group.current.position.y = Math.sin(t * 0.5) * 0.05
      group.current.rotation.z = Math.sin(t * 0.35) * 0.01
      group.current.rotation.x = Math.sin(t * 0.45) * 0.012
    }
  })

  return (
    <group ref={group}>
      {/* the glass tablet — transmissive, slightly larger than the screen so a
          glass border frames the content */}
      <RoundedBox
        args={[GLASS_W + 0.2, GLASS_H + 0.2, 0.07]}
        radius={0.06}
        smoothness={5}
        position={[0, 0, -0.02]}
      >
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.7}
          roughness={0.07}
          ior={1.4}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.1}
          color="#eef2f7"
          attenuationColor="#d3dae3"
          attenuationDistance={3}
          transparent
        />
        <Edges threshold={15} color="#dfe7f2" />
      </RoundedBox>

      {/* live homepage on the glass */}
      <Html
        transform
        position={[0, 0, 0.04]}
        scale={DOM_SCALE}
        zIndexRange={[20, 0]}
        style={{ width: `${DOM_W}px`, height: `${DOM_H}px` }}
      >
        <ScreenApp onOpenWindow={onOpenWindow} onNavigate={onNavigate} />
      </Html>

      {/* very soft cool spill */}
      <pointLight position={[0, 0, 1]} intensity={1.4} distance={6} decay={2} color="#e6eefa" />
    </group>
  )
}
