"use client"

import { RoundedBox, Html, Edges } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { TerminalWindow } from "@/homepage"
import type { Tablet } from "./tablets"

const C = 0.02537 // world-units per (px · scale)

const SIZES = {
  medium: { glassW: 2.9, glassH: 2.18, domW: 780, domH: 586 },
  large: { glassW: 4.1, glassH: 2.56, domW: 1440, domH: 900 },
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
  const { glassW, glassH, domW, domH } = SIZES[tablet.size]
  // leave a grabbable glass border around the content
  const contentW = glassW - 0.34
  const scale = contentW / (domW * C)

  const { camera, gl } = useThree()
  const controls = useThree((s) => s.controls) as unknown as
    | { enabled: boolean }
    | undefined

  const [dragging, setDragging] = useState(false)
  const plane = useRef(new THREE.Plane())
  const offset = useRef(new THREE.Vector3())
  const raycaster = useRef(new THREE.Raycaster())

  function startDrag(e: { stopPropagation: () => void; point: THREE.Vector3 }) {
    e.stopPropagation()
    const pos = new THREE.Vector3(...tablet.position)
    const n = camera.getWorldDirection(new THREE.Vector3()).negate()
    plane.current.setFromNormalAndCoplanarPoint(n, pos)
    offset.current.copy(pos).sub(e.point)
    if (controls) controls.enabled = false
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return
    const el = gl.domElement
    function move(ev: PointerEvent) {
      const rect = el.getBoundingClientRect()
      const nx = ((ev.clientX - rect.left) / rect.width) * 2 - 1
      const ny = -((ev.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.current.setFromCamera(new THREE.Vector2(nx, ny), camera)
      const hit = new THREE.Vector3()
      if (raycaster.current.ray.intersectPlane(plane.current, hit)) {
        hit.add(offset.current)
        onMove(tablet.id, [hit.x, hit.y, hit.z])
      }
    }
    function up() {
      setDragging(false)
      if (controls) controls.enabled = true
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging])

  return (
    <group position={tablet.position}>
      {/* glass slab — its border is the drag handle */}
      <RoundedBox
        args={[glassW, glassH, 0.06]}
        radius={0.05}
        smoothness={5}
        onPointerDown={startDrag}
        onPointerOver={() => (document.body.style.cursor = "grab")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.6}
          roughness={0.08}
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

      {/* content */}
      <Html
        transform
        position={[0, 0, 0.04]}
        scale={scale}
        zIndexRange={[18, 0]}
        style={{ width: `${domW}px`, height: `${domH}px` }}
      >
        {tablet.kind === "route" ? (
          <iframe
            src={tablet.key}
            title={tablet.label}
            style={{
              width: `${domW}px`,
              height: `${domH}px`,
              border: 0,
              borderRadius: 18,
              background: "#0a0a0f",
            }}
          />
        ) : (
          <div
            style={{
              width: `${domW}px`,
              height: `${domH}px`,
              position: "relative",
            }}
          >
            <TerminalWindow
              window={{
                id: String(tablet.id),
                type: tablet.key,
                title: `messier@terminal: ~/${tablet.key}`,
                position: { x: Math.max(20, (domW - 560) / 2), y: 24 },
                zIndex: 1,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any}
              onClose={() => onClose(tablet.id)}
              onFocus={() => {}}
              onDrag={() => {}}
            />
          </div>
        )}
      </Html>

      {/* close button (screen-space, always crisp) */}
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
    </group>
  )
}
