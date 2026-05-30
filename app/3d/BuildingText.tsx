"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo } from "react"
import * as THREE from "three"

/* ============================================================
   messier // 3d — text projected onto a void monolith.
   A thin horizontal marquee band hugs the four vertical faces of
   an EXISTING building; UVs run continuously around the perimeter
   and the texture offset animates so the text drifts around the
   sides. Renders only the band — the box is the instanced monolith.
   ============================================================ */

const MONO = '"DM Mono", "Courier New", ui-monospace, monospace'

// light, thin repeating-text strip drawn to a canvas
function makeMarquee(text: string) {
  const px = 72
  const padX = px * 1.0
  const font = `300 ${px}px ${MONO}`
  const meas = document.createElement("canvas").getContext("2d")!
  meas.font = font
  const tw = Math.ceil(meas.measureText(text).width) + padX
  const ch = Math.ceil(px * 1.9)

  const c = document.createElement("canvas")
  c.width = tw
  c.height = ch
  const ctx = c.getContext("2d")!
  ctx.font = font
  ctx.fillStyle = "#565e6f"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.shadowColor = "rgba(70, 78, 94, 0.22)"
  ctx.shadowBlur = px * 0.05
  ctx.fillText(text, tw / 2, ch / 2)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.anisotropy = 8
  tex.needsUpdate = true
  return { tex, tw, ch }
}

// custom geometry: a horizontal band on the 4 vertical faces of a box, with u
// running 0..1 continuously around the perimeter so text wraps across the sides
function wrapGeometry(w: number, d: number, bandH: number, yCenter: number) {
  const eps = 0.04 // sit just proud of the surface to avoid z-fighting
  const hw = w / 2 + eps
  const hd = d / 2 + eps
  const y0 = yCenter - bandH / 2
  const y1 = yCenter + bandH / 2
  const corners: [number, number][] = [
    [-hw, hd],
    [hw, hd],
    [hw, -hd],
    [-hw, -hd],
    [-hw, hd],
  ]
  const P = 2 * (w + d)
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  let acc = 0
  let vi = 0
  for (let i = 0; i < 4; i++) {
    const [ax, az] = corners[i]
    const [bx, bz] = corners[i + 1]
    const segLen = Math.hypot(bx - ax, bz - az)
    const u0 = acc / P
    const u1 = (acc + segLen) / P
    acc += segLen
    pos.push(ax, y0, az, bx, y0, bz, bx, y1, bz, ax, y1, az)
    uv.push(u0, 0, u1, 0, u1, 1, u0, 1)
    idx.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3)
    vi += 4
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

export type BuildingTextProps = {
  position: [number, number, number] // building center (matches the instance)
  size: [number, number, number] // w, h, d (building dimensions)
  text: string
  bandY?: number // band center as a fraction of height (0 bottom .. 1 top)
  bandH?: number // band height in world units
  speed?: number // scroll speed in uv units per second
}

export default function BuildingText({
  position,
  size,
  text,
  bandY = 0.5,
  bandH = 1.0,
  speed = 0.04,
}: BuildingTextProps) {
  const [w, h, d] = size
  const yCenter = -h / 2 + bandY * h

  // repeat the text around the perimeter as many times as keeps it undistorted
  const tex = useMemo(() => {
    const { tex, tw, ch } = makeMarquee(text)
    const perimeter = 2 * (w + d)
    const copies = Math.max(1, Math.min(6, Math.round((perimeter * ch) / (bandH * tw))))
    tex.repeat.set(copies, 1)
    return tex
  }, [text, w, d, bandH])

  const geo = useMemo(() => wrapGeometry(w, d, bandH, yCenter), [w, d, bandH, yCenter])

  useFrame((_, dt) => {
    // wrap into [0,1) so negative (reverse) speeds scroll cleanly too
    tex.offset.x = (((tex.offset.x + speed * Math.min(dt, 0.05)) % 1) + 1) % 1
  })

  return (
    <mesh geometry={geo} position={position}>
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={0.85}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}
