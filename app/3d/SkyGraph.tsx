"use client"

import { Billboard, Text } from "@react-three/drei"
import { useEffect, useMemo, useState } from "react"
import * as THREE from "three"

/* ============================================================
   messier // 3d — a filtered Obsidian graph wrapped across the sky.
   Book-notes + sources + the tags that connect them (titles only,
   from /public/graph.json). Grey, lowercase, DM Mono; tag names are
   always light-pink; hovering lights a node's links pink. Sits in
   the fog on purpose, so it reads as a misty constellation.
   ============================================================ */

const FONT = "/fonts/DMMono-Regular.ttf"
const PINK = "#f472b6"
const NODE = "#3b414a"
const NODE_HOT = "#cbd2dc"
const LABEL_GREY = "#5b6573"

const R = 28 // sky radius — close enough that fog only lightly veils it
const ELEV_HI = 42 // degrees above horizon at the cluster centre (sits lower now)
const ELEV_LO = 3 // degrees at the sparse edges (near the horizon)
const SPREAD_POW = 0.62 // <1 pushes the dense centre outward so it fills more sky

type GNode = {
  id: string
  title: string
  type: "source" | "note" | "tag"
  folder: string
  degree: number
  x: number
  y: number
}
type Graph = { nodes: GNode[]; links: { source: string; target: string }[] }

function worldPos(n: GNode): [number, number, number] {
  const az = Math.atan2(n.y, n.x)
  const r = Math.pow(Math.min(1, Math.hypot(n.x, n.y)), SPREAD_POW)
  const elev = (ELEV_HI - r * (ELEV_HI - ELEV_LO)) * (Math.PI / 180)
  const polar = Math.PI / 2 - elev
  const sp = Math.sin(polar)
  return [R * sp * Math.cos(az), R * Math.cos(polar), R * sp * Math.sin(az)]
}

const RADIUS: Record<GNode["type"], number> = { source: 0.09, note: 0.06, tag: 0.1 }

export default function SkyGraph() {
  const [graph, setGraph] = useState<Graph | null>(null)
  const [hover, setHover] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetch("/graph.json")
      .then((r) => r.json())
      .then((g) => alive && setGraph(g))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const { pos, neighbors } = useMemo(() => {
    const pos = new Map<string, THREE.Vector3>()
    const neighbors = new Map<string, Set<string>>()
    if (graph) {
      graph.nodes.forEach((n) => pos.set(n.id, new THREE.Vector3(...worldPos(n))))
      graph.links.forEach((l) => {
        ;(neighbors.get(l.source) ?? neighbors.set(l.source, new Set()).get(l.source)!).add(l.target)
        ;(neighbors.get(l.target) ?? neighbors.set(l.target, new Set()).get(l.target)!).add(l.source)
      })
    }
    return { pos, neighbors }
  }, [graph])

  const baseLines = useMemo(() => {
    if (!graph) return null
    const a: number[] = []
    graph.links.forEach((l) => {
      const s = pos.get(l.source), t = pos.get(l.target)
      if (s && t) a.push(s.x, s.y, s.z, t.x, t.y, t.z)
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(a, 3))
    return g
  }, [graph, pos])

  const hotLines = useMemo(() => {
    if (!graph || !hover) return null
    const a: number[] = []
    graph.links.forEach((l) => {
      if (l.source !== hover && l.target !== hover) return
      const s = pos.get(l.source), t = pos.get(l.target)
      if (s && t) a.push(s.x, s.y, s.z, t.x, t.y, t.z)
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(a, 3))
    return g
  }, [graph, hover, pos])

  if (!graph) return null
  const near = (id: string) => hover != null && (id === hover || neighbors.get(hover)?.has(id))

  return (
    <group>
      {baseLines && (
        <lineSegments geometry={baseLines}>
          <lineBasicMaterial color={NODE} transparent opacity={0.14} depthWrite={false} />
        </lineSegments>
      )}
      {hotLines && (
        <lineSegments geometry={hotLines}>
          <lineBasicMaterial color={PINK} transparent opacity={0.75} depthWrite={false} />
        </lineSegments>
      )}

      {graph.nodes.map((n) => {
        const p = pos.get(n.id)!
        const hovered = hover === n.id
        const isNear = near(n.id)
        const isTag = n.type === "tag"
        const nodeColor = hovered ? (isTag ? PINK : NODE_HOT) : NODE
        const r = RADIUS[n.type] * (hovered ? 1.8 : 1) * (1 + Math.min(0.35, n.degree * 0.01))
        const showLabel = isTag || isNear
        const label = (n.title.length > 30 ? n.title.slice(0, 29) + "…" : n.title).toLowerCase()
        const labelColor = isTag ? PINK : LABEL_GREY
        return (
          <group key={n.id} position={p}>
            <mesh
              onPointerOver={(e) => { e.stopPropagation(); setHover(n.id); document.body.style.cursor = "pointer" }}
              onPointerOut={() => { setHover((h) => (h === n.id ? null : h)); document.body.style.cursor = "auto" }}
            >
              <sphereGeometry args={[r, 12, 12]} />
              <meshBasicMaterial color={nodeColor} transparent opacity={isNear || hover == null ? 0.9 : 0.45} />
            </mesh>
            {showLabel && (
              <Billboard position={[0, r + 0.18, 0]}>
                <Text
                  font={FONT}
                  fontSize={isTag ? 0.3 : 0.24}
                  letterSpacing={0.04}
                  color={labelColor}
                  anchorX="center"
                  anchorY="bottom"
                  outlineWidth={0.01}
                  outlineColor="#cdd2da"
                  fillOpacity={hover == null || isNear ? 1 : 0.4}
                >
                  {label}
                </Text>
              </Billboard>
            )}
          </group>
        )
      })}
    </group>
  )
}
