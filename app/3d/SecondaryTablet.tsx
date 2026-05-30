"use client"

import { RoundedBox, Html, Edges } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { TerminalWindow } from "@/homepage"
import type { Tablet } from "./tablets"

const C = 0.02537 // world-units per (px · scale)
const DRAG_THRESHOLD = 5 // px of movement before a press becomes a drag (so clicks still register)

// screen (content) size in world units; the glass slab is screen + the border.
const BORDER = 0.12 // thin glass frame around the content (0.06 / side)
const SIZES = {
  medium: { screenW: 2.56, domW: 780, domH: 586 },
  large: { screenW: 4.1, domW: 1440, domH: 900 },
}

export default function SecondaryTablet({
  tablet,
  onClose,
  onMove,
}: {
  tablet: Tablet
  onClose: (id: number) => void
  onMove: (id: number, pos: [number, number, number]) => void
}) {
  const { screenW, domW, domH } = SIZES[tablet.size]
  const scale = screenW / (domW * C) // content fills the glass, like the main tablet
  const screenH = (domH / domW) * screenW
  const glassW = screenW + BORDER
  const glassH = screenH + BORDER

  const { camera, gl } = useThree()
  const controls = useThree((s) => s.controls) as unknown as
    | { enabled: boolean }
    | undefined

  const [dragging, setDragging] = useState(false)
  const plane = useRef(new THREE.Plane())
  const offset = useRef(new THREE.Vector3())
  const raycaster = useRef(new THREE.Raycaster())
  const gesture = useRef<{ active: boolean; startX: number; startY: number } | null>(null)

  // raycast a screen point onto the current drag plane
  function planeHit(clientX: number, clientY: number) {
    const el = gl.domElement
    const rect = el.getBoundingClientRect()
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1
    raycaster.current.setFromCamera(new THREE.Vector2(nx, ny), camera)
    const hit = new THREE.Vector3()
    return raycaster.current.ray.intersectPlane(plane.current, hit) ? hit : null
  }

  function onPointerMove(ev: PointerEvent) {
    const g = gesture.current
    if (!g) return
    if (!g.active) {
      if (Math.hypot(ev.clientX - g.startX, ev.clientY - g.startY) < DRAG_THRESHOLD) return
      g.active = true
      if (controls) controls.enabled = false
      setDragging(true) // disables iframe pointer-events + shows grabbing cursor
    }
    const hit = planeHit(ev.clientX, ev.clientY)
    if (hit) {
      hit.add(offset.current)
      onMove(tablet.id, [hit.x, hit.y, hit.z])
    }
  }

  function onPointerUp() {
    const g = gesture.current
    gesture.current = null
    window.removeEventListener("pointermove", onPointerMove)
    window.removeEventListener("pointerup", onPointerUp)
    if (g?.active) {
      if (controls) controls.enabled = true
      setDragging(false)
    }
  }

  // begin a press anywhere on the glass; only turns into a drag past the threshold
  function beginGesture(clientX: number, clientY: number) {
    const pos = new THREE.Vector3(...tablet.position)
    const n = camera.getWorldDirection(new THREE.Vector3()).negate()
    plane.current.setFromNormalAndCoplanarPoint(n, pos)
    const grab = planeHit(clientX, clientY)
    offset.current.copy(pos).sub(grab ?? pos)
    gesture.current = { active: false, startX: clientX, startY: clientY }
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
  }

  // tidy up listeners if the tablet unmounts mid-drag
  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      if (controls) controls.enabled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <group position={tablet.position}>
      {/* glass slab — grab the frame (or anywhere on the content) to move it */}
      <RoundedBox
        args={[glassW, glassH, 0.07]}
        radius={0.06}
        smoothness={5}
        onPointerDown={(e) => {
          e.stopPropagation()
          const ne = e.nativeEvent as PointerEvent
          beginGesture(ne.clientX, ne.clientY)
        }}
        onPointerOver={() => (document.body.style.cursor = "grab")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
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

      {/* content — same translucent CRT glass treatment as the main tablet
          (transparent + slight opacity so the void shows faintly through) */}
      <Html
        transform
        position={[0, 0, 0.04]}
        scale={scale}
        zIndexRange={[18, 0]}
        style={{ width: `${domW}px`, height: `${domH}px` }}
      >
        <div
          className="crt-shell crt-shell--tablet"
          onPointerDown={(e) => beginGesture(e.clientX, e.clientY)}
          style={{ cursor: dragging ? "grabbing" : "grab" }}
        >
          {tablet.kind === "route" ? (
            <iframe
              src={tablet.key}
              title={tablet.label}
              style={{
                width: `${domW}px`,
                height: `${domH}px`,
                border: 0,
                background: "transparent",
                // let drags over the iframe reach the canvas; allow clicks otherwise
                pointerEvents: dragging ? "none" : "auto",
              }}
            />
          ) : (
            <div
              className="tablet-fill"
              style={{
                width: `${domW}px`,
                height: `${domH}px`,
                position: "relative",
                pointerEvents: dragging ? "none" : "auto",
              }}
            >
              <TerminalWindow
                window={{
                  id: String(tablet.id),
                  type: tablet.key,
                  title: `messier@terminal: ~/${tablet.key}`,
                  position: { x: 0, y: 0 },
                  zIndex: 1,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any}
                onClose={() => onClose(tablet.id)}
                onFocus={() => {}}
                onDrag={() => {}}
              />
            </div>
          )}
          <div className="crt-shell__scan" />
          <div className="crt-shell__vignette" />
          <div className="crt-shell__flicker" />
        </div>
      </Html>

      {/* close button (screen-space, always crisp) — only for route/iframe
          tablets, which have no in-window red-dot close of their own. Terminal
          windows close via their own red title-bar dot. */}
      {tablet.kind === "route" && (
        <Html position={[glassW / 2 - 0.12, glassH / 2 - 0.05, 0.05]} center>
          <button
            className="tablet-close"
            onClick={(e) => {
              e.stopPropagation()
              onClose(tablet.id)
            }}
            aria-label="close tablet"
          >
            ×
          </button>
        </Html>
      )}
    </group>
  )
}
