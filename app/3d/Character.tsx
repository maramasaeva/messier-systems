"use client"

import { useGLTF, useTexture, useAnimations } from "@react-three/drei"
import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useDollBrain, SPEED } from "./doll/useDollBrain"
import { ARRIVE, ACCEL, TURN, DECEL_DIST, FOOT_Y, NOMINAL_WALK_SPEED, FADE } from "./doll/behaviorConfig"

/**
 * The rigged glass doll. Loads the skinned character.glb (Mixamo rig + named
 * animation clips), keeps the glass body + unlit ink tattoo materials, and lets a
 * small behavior "brain" (useDollBrain) drive it around the void — wandering,
 * idling, lying down, looking around, walking to buildings — with eased motion and
 * crossfaded animations. The tattoos are skinned, so they deform with the body.
 */

// shortest-path angle damp (no 359°→1° spin)
function dampAngle(cur: number, tgt: number, lambda: number, dt: number) {
  let d = ((tgt - cur + Math.PI) % (2 * Math.PI)) - Math.PI
  if (d < -Math.PI) d += 2 * Math.PI
  return cur + d * (1 - Math.exp(-lambda * dt))
}

export default function Character({
  scale = 1,
  position = [0, 0, 0] as [number, number, number],
  active = true,
}: {
  scale?: number
  position?: [number, number, number]
  active?: boolean
}) {
  const group = useRef<THREE.Group>(null!)
  // single instance → use the scene directly (cloning a skinned GLTF breaks the skeleton)
  const { scene, animations } = useGLTF("/character.glb")
  const [legTex, handTex] = useTexture(["/tattoos/tat_leg_ink.png", "/tattoos/tat_hand_ink.png"])
  const { actions } = useAnimations(animations, group)
  const brain = useDollBrain(Math.atan2(position[2], position[0]))
  const speedRef = useRef(0)
  const activeRef = useRef<THREE.AnimationAction | null>(null)

  // materials: glass body + crisp unlit black ink on the tattoo meshes (deform via skin)
  useEffect(() => {
    const skin = new THREE.MeshPhysicalMaterial({
      color: "#eef2f7",
      transmission: 1,
      thickness: 0.35,
      roughness: 0.16,
      ior: 1.45,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.2,
      attenuationColor: new THREE.Color("#d8e2ec"),
      attenuationDistance: 1.6,
      transparent: true,
      side: THREE.DoubleSide,
    })
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = false
      mesh.receiveShadow = false
      mesh.frustumCulled = false // skinned bounds wander; keep it from popping out
      const name = mesh.name.toLowerCase()
      if (name.includes("tattoo")) {
        const tex = name.includes("leg") ? legTex : handTex
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        mesh.material = new THREE.MeshBasicMaterial({
          map: tex,
          color: "#0a0a0c",
          transparent: true,
          alphaTest: 0.06,
          side: THREE.DoubleSide,
          depthTest: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -8,
          polygonOffsetUnits: -8,
          toneMapped: false,
        })
        mesh.renderOrder = 3
      } else {
        mesh.material = skin
      }
    })
  }, [scene, legTex, handTex])

  // tell the brain how long each non-looping clip runs (for "clip"-held phases)
  useEffect(() => {
    const d: Record<string, number> = {}
    for (const k in actions) {
      const a = actions[k]
      if (a) d[k] = a.getClip().duration
    }
    brain.setDurations(d)
  }, [actions, brain])

  function crossfadeTo(name: string, loop: boolean) {
    const next = actions[name]
    if (!next || next === activeRef.current) return
    next.reset()
    next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1)
    next.clampWhenFinished = !loop
    next.enabled = true
    next.timeScale = 1
    next.setEffectiveWeight(1).fadeIn(FADE).play()
    activeRef.current?.fadeOut(FADE)
    activeRef.current = next
  }

  useFrame((st, dtRaw) => {
    if (!active || !group.current) return
    const dt = Math.min(dtRaw, 0.05)
    const t = st.clock.elapsedTime
    brain.tick(t, dt)
    const v = brain.view()
    const g = group.current

    // locomotion toward target on the XZ ground plane
    let desired = 0
    if (v.target) {
      const dx = v.target.x - g.position.x
      const dz = v.target.y - g.position.z
      const dist = Math.hypot(dx, dz)
      if (dist <= ARRIVE) {
        brain.onArrive(t)
      } else {
        const cruise = SPEED[v.pace]
        desired = Math.max(cruise * THREE.MathUtils.smoothstep(dist, 0, DECEL_DIST), cruise * 0.2)
        g.rotation.y = dampAngle(g.rotation.y, Math.atan2(dx, dz), TURN, dt)
      }
    }
    speedRef.current = THREE.MathUtils.damp(speedRef.current, desired, ACCEL, dt)
    if (speedRef.current > 0.001) {
      g.position.x += Math.sin(g.rotation.y) * speedRef.current * dt
      g.position.z += Math.cos(g.rotation.y) * speedRef.current * dt
    }
    g.position.y = FOOT_Y

    // animation: walk loops with speed-synced playback; everything else crossfades in
    if (v.clip === "walk") {
      crossfadeTo("walk", true)
      const a = actions.walk
      if (a) a.timeScale = THREE.MathUtils.clamp(speedRef.current / NOMINAL_WALK_SPEED, 0.4, 2.4)
    } else {
      crossfadeTo(v.clip, v.loop)
    }
  })

  return (
    <group ref={group} position={position} scale={scale}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload("/character.glb")
