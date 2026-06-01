"use client"

import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import * as THREE from "three"

/* "back to centre" — listens for a window event from the HUD button and
   smoothly flies the camera + orbit pivot back to the default view of the
   tablet (matches the Canvas camera and OrbitControls target in Scene). */

const HOME_POS = new THREE.Vector3(0, 0.1, 4.2)
const HOME_TARGET = new THREE.Vector3(0, 0, 0.1)

export default function Recenter() {
  const camera = useThree((s) => s.camera)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controls = useThree((s) => s.controls) as any
  const animating = useRef(false)

  useEffect(() => {
    const go = () => (animating.current = true)
    window.addEventListener("messier-recenter", go)
    return () => window.removeEventListener("messier-recenter", go)
  }, [])

  useFrame(() => {
    if (!animating.current) return
    const target = controls?.target as THREE.Vector3 | undefined
    camera.position.lerp(HOME_POS, 0.12)
    target?.lerp(HOME_TARGET, 0.12)
    controls?.update?.()
    if (
      camera.position.distanceTo(HOME_POS) < 0.02 &&
      (!target || target.distanceTo(HOME_TARGET) < 0.02)
    ) {
      camera.position.copy(HOME_POS)
      target?.copy(HOME_TARGET)
      controls?.update?.()
      animating.current = false
    }
  })

  return null
}
