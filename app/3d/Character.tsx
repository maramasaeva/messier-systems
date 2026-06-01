"use client"

import { useGLTF } from "@react-three/drei"
import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/**
 * The doll, generated from reference photos (Hunyuan3D). Static mesh for now —
 * smooth normals + a pale material + a gentle idle. Walking comes once it's
 * rigged. Tattoos will be the only thing added on top, later.
 */
export default function Character({
  scale = 1,
  position = [0, 0, 0] as [number, number, number],
}: {
  scale?: number
  position?: [number, number, number]
}) {
  const group = useRef<THREE.Group>(null!)
  const { scene } = useGLTF("/character.glb")

  const model = useMemo(() => {
    const root = scene.clone(true)
    // glass doll — same transmissive treatment as the tablets
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
    root.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = false
      mesh.receiveShadow = false
      if (mesh.name.toLowerCase().includes("tattoo")) {
        // black ink decal painted on the glass — keep its texture material
        const mm = mesh.material as THREE.MeshStandardMaterial
        mm.transparent = true
        mm.depthWrite = false
        mm.polygonOffset = true
        mm.polygonOffsetFactor = -6
        mm.polygonOffsetUnits = -6
        mesh.renderOrder = 2
      } else {
        mesh.material = skin // glass body
      }
    })
    return root
  }, [scene])

  // gentle idle: subtle bob + slow turn so it reads as "alive" while static
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime
    group.current.position.y = position[1] + Math.sin(t * 1.1) * 0.025
    group.current.rotation.y = Math.sin(t * 0.18) * 0.35
  })

  return (
    <group ref={group} position={position} scale={scale}>
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload("/character.glb")
