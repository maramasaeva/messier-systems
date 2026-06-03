"use client"

import { Grid, Instances, Instance } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from "three"
import BuildingText from "./BuildingText"
import { GROUND_Y, generateBlocks } from "./void/blocks"

// pool of texts projected onto the monoliths, drawn from in scene order
const TEXTS: string[] = [
  "MY BODY · MY SOFTWARE · ",
  "// THIS_ORGANISM_AND_DERIVATIVE_GENETIC_MATERIAL_IS_RESTRICTED_INTELLECTUAL_PROPERTY_ · ",
  "At Least, Be Human · せめて、人間らしく · ",
  "(1) In the Beginning Is the Dot, or Point. · ",
  "Don't Trust people in the Cyber World · ",
  "HIGHFUNCTIONINGFLESH ",
  "THERE IS NO MEME · I LOVE YOU · ",
  ">Present Day   >Present Time   >_   ",
  "Spectrum of Consciousness · ",
  "Syndrome Syndrome · ",
  "the night begins to shine · ",
  "isnt it so beautiful, isnt it so wonderful? · ",
]

function useBlocks(count: number) {
  return useMemo(() => generateBlocks(count), [count])
}

// faint window-grid facade so the monoliths read as dead digital architecture
function useGridTexture() {
  return useMemo(() => {
    const s = 256
    const c = document.createElement("canvas")
    c.width = c.height = s
    const ctx = c.getContext("2d")!
    ctx.fillStyle = "#c2c8d1"
    ctx.fillRect(0, 0, s, s)
    ctx.strokeStyle = "#a2aab8"
    ctx.lineWidth = 1.5
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

  // scatter the texts across monoliths of all sizes, spread around the viewer
  const placements = useMemo(() => {
    type Placement = {
      key: string
      position: [number, number, number]
      size: [number, number, number]
      text: string
      bandY: number
      speed: number
    }

    // any monolith with a wide enough face, within near-to-mid range
    const cands = blocks
      .map((b, i) => ({ b, i, rad: Math.hypot(b.pos[0], b.pos[2]) }))
      .filter((x) => Math.min(x.b.scale[0], x.b.scale[2]) >= 1.3 && x.rad <= 26)
      .sort((a, c) => a.rad - c.rad)
      .slice(0, 14)

    let t = 0
    const nextText = () => TEXTS[t++ % TEXTS.length]
    const out: Placement[] = []

    cands.forEach((x, k) => {
      const h = x.b.scale[1]
      const dir = k % 2 === 0 ? 1 : -1 // alternate scroll direction
      const speed = (0.03 + (k % 3) * 0.013) * dir
      const bandY = 0.3 + (k % 4) * 0.14 // 0.30 .. 0.72, varied heights
      out.push({ key: `${x.i}-a`, position: x.b.pos, size: x.b.scale, text: nextText(), bandY, speed })

      // occasionally a second quote on a tall monolith, scrolling the other way
      if (h >= 9 && k % 3 === 0) {
        const bandY2 = bandY > 0.5 ? bandY - 0.32 : bandY + 0.32
        out.push({
          key: `${x.i}-b`,
          position: x.b.pos,
          size: x.b.scale,
          text: nextText(),
          bandY: bandY2,
          speed: -speed * 0.85,
        })
      }
    })
    return out
  }, [blocks])

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
        fadeDistance={22}
        fadeStrength={8}
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

      {/* text projected around the sides of the monoliths */}
      {placements.map((p) => (
        <BuildingText
          key={p.key}
          position={p.position}
          size={p.size}
          text={p.text}
          bandY={p.bandY}
          speed={p.speed}
        />
      ))}
    </group>
  )
}
