"use client"

import { Grid, Instances, Instance } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from "three"

const GROUND_Y = -3.2

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Block = { pos: [number, number, number]; scale: [number, number, number] }

function useBlocks(count: number): Block[] {
  return useMemo(() => {
    const rnd = mulberry32(2024)
    const blocks: Block[] = []
    for (let i = 0; i < count; i++) {
      // pushed out past the viewer, thinning into the mist
      const ang = rnd() * Math.PI * 2
      const rad = 11 + Math.pow(rnd(), 0.5) * 36
      const x = Math.cos(ang) * rad
      const z = Math.sin(ang) * rad
      const h = 2 + rnd() * 15
      const w = 0.8 + rnd() * 3.2
      const d = 0.8 + rnd() * 3.2
      blocks.push({ pos: [x, GROUND_Y + h / 2, z], scale: [w, h, d] })
    }
    return blocks
  }, [count])
}

// faint window-grid facade so the monoliths read as dead digital architecture
function useGridTexture() {
  return useMemo(() => {
    const s = 128
    const c = document.createElement("canvas")
    c.width = c.height = s
    const ctx = c.getContext("2d")!
    ctx.fillStyle = "#c2c8d1"
    ctx.fillRect(0, 0, s, s)
    ctx.strokeStyle = "#969db0"
    ctx.lineWidth = 6
    const step = s / 4
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath()
      ctx.moveTo(i * step, 0)
      ctx.lineTo(i * step, s)
      ctx.moveTo(0, i * step)
      ctx.lineTo(s, i * step)
      ctx.stroke()
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(2, 3)
    return tex
  }, [])
}

export default function DigitalVoid() {
  const blocks = useBlocks(72)
  const grid = useGridTexture()

  return (
    <group>
      {/* pale flat ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y, 0]}>
        <planeGeometry args={[260, 260]} />
        <meshStandardMaterial color="#c7ccd4" roughness={1} metalness={0} />
      </mesh>

      {/* glowing digital floor grid, fading into the mist */}
      <Grid
        position={[0, GROUND_Y + 0.01, 0]}
        infiniteGrid
        cellSize={1}
        cellThickness={0.6}
        cellColor="#9aa3b2"
        sectionSize={6}
        sectionThickness={1.1}
        sectionColor="#7c889a"
        fadeDistance={50}
        fadeStrength={3}
      />

      {/* ghost monoliths */}
      <Instances limit={blocks.length}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          map={grid}
          color="#bcc2cb"
          roughness={0.92}
          metalness={0}
          transparent
          opacity={0.55}
        />
        {blocks.map((b, i) => (
          <Instance key={i} position={b.pos} scale={b.scale} />
        ))}
      </Instances>
    </group>
  )
}
