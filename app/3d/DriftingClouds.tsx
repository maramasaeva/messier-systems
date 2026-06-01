"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

/* soft mist that drifts slowly through the void — denser in some places,
   thinner in others, gently moving so the fog never sits still.
   Billboarded sprites with a soft radial alpha; respects the scene fog. */

function softTexture() {
  const s = 128
  const c = document.createElement("canvas")
  c.width = c.height = s
  const ctx = c.getContext("2d")!
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, "rgba(255,255,255,0.9)")
  g.addColorStop(0.45, "rgba(255,255,255,0.3)")
  g.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Puff = {
  base: [number, number, number]
  scale: number
  opacity: number
  sx: number
  sz: number
  ph: number
  freq: number
}

export default function DriftingClouds() {
  const tex = useMemo(softTexture, [])
  const puffs = useMemo<Puff[]>(() => {
    const rnd = mulberry32(42)
    return Array.from({ length: 9 }, () => ({
      base: [(rnd() - 0.5) * 72, 4 + rnd() * 15, -8 - rnd() * 32] as [number, number, number],
      scale: 13 + rnd() * 22,
      opacity: 0.05 + rnd() * 0.1,
      sx: 3 + rnd() * 5,
      sz: 2 + rnd() * 4,
      ph: rnd() * Math.PI * 2,
      freq: 0.008 + rnd() * 0.016,
    }))
  }, [])
  const refs = useRef<THREE.Sprite[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    puffs.forEach((p, i) => {
      const s = refs.current[i]
      if (!s) return
      s.position.set(
        p.base[0] + Math.sin(t * p.freq + p.ph) * p.sx,
        p.base[1] + Math.sin(t * p.freq * 0.7 + p.ph) * 1.4,
        p.base[2] + Math.cos(t * p.freq + p.ph) * p.sz
      )
      ;(s.material as THREE.SpriteMaterial).opacity = p.opacity * (0.65 + 0.35 * Math.sin(t * p.freq * 1.3 + p.ph))
    })
  })

  return (
    <group>
      {puffs.map((p, i) => (
        <sprite
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el
          }}
          scale={[p.scale, p.scale * 0.6, 1]}
          position={p.base}
        >
          <spriteMaterial map={tex} color="#e8ebf0" transparent opacity={p.opacity} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}
