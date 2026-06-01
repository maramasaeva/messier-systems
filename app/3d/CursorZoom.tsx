"use client"

import { useThree } from "@react-three/fiber"
import { useEffect } from "react"
import * as THREE from "three"

/* ============================================================
   messier // 3d — zoom toward whatever is under the cursor.
   Each wheel notch moves the camera (and the orbit pivot) a small
   FRACTION of the remaining distance to the point you're pointing
   at — the tablet, the doll, a graph node, the floor — so it eases
   in and naturally slows down as you get close. Replaces
   OrbitControls' built-in zoom (set enableZoom={false}).
   ============================================================ */

const SPEED = 0.0011 // wheel-delta -> fraction of distance
const MIN_STEP = 0.006
const MAX_STEP = 0.15
const NEAREST = 0.45 // never push closer than this to the focus point
const FARTHEST = 110 // don't fly off into the void forever
const MIN_OUT = 0.6 // floor on the zoom-OUT step so you never get stuck glued to a node
const MAX_ABS = 9 // cap any single notch so a trackpad fling can't yeet you

export default function CursorZoom() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controls = useThree((s) => s.controls) as any

  useEffect(() => {
    const el = gl.domElement
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const move = new THREE.Vector3()
    const ORIGIN = new THREE.Vector3(0, 0, 0)

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      )
      ray.setFromCamera(ndc, camera)

      const target: THREE.Vector3 = controls?.target ?? ORIGIN
      // focus = nearest thing under the cursor, else a point at the orbit distance
      const hits = ray.intersectObjects(scene.children, true)
      const focus = hits.length
        ? hits[0].point.clone()
        : ray.ray.at(camera.position.distanceTo(target), new THREE.Vector3())

      const inward = e.deltaY < 0
      const dist = camera.position.distanceTo(focus)
      if (inward && dist < NEAREST) return
      if (!inward && camera.position.distanceTo(ORIGIN) > FARTHEST) return

      const frac = THREE.MathUtils.clamp(Math.abs(e.deltaY) * SPEED, MIN_STEP, MAX_STEP)
      // zoom IN eases (a fraction of the remaining distance, so it slows as you
      // approach); zoom OUT keeps a steady floor so you can always back away,
      // even when glued right up against a node.
      let stepLen = dist * frac
      if (!inward) stepLen = Math.max(stepLen, MIN_OUT)
      stepLen = Math.min(stepLen, MAX_ABS)

      move.subVectors(focus, camera.position)
      if (move.lengthSq() > 0) move.normalize()
      move.multiplyScalar(inward ? stepLen : -stepLen)
      camera.position.add(move)
      target.add(move) // move the pivot too, so you orbit around where you zoomed
      controls?.update?.()
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [camera, gl, scene, controls])

  return null
}
