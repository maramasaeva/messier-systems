"use client"

import { useGLTF, useTexture } from "@react-three/drei"
import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/**
 * The doll, generated from reference photos (Hunyuan3D), rendered as hollow glass.
 * The two tattoos (meshes tattoo_leg / tattoo_hand in the GLB) are decals projected
 * onto the body surface in Blender (Project shrinkwrap), so they conform to the
 * limbs. Here we just give those meshes the cleaned hand-drawn ink as an unlit
 * overlay so it reads as crisp black ink on the glass.
 */
export default function Character({
  scale = 1,
  position = [0, 0, 0] as [number, number, number],
  idle = true,
}: {
  scale?: number
  position?: [number, number, number]
  idle?: boolean
}) {
  const group = useRef<THREE.Group>(null!)
  const { scene } = useGLTF("/character.glb")
  const [legTex, handTex] = useTexture(["/tattoos/tat_leg_ink.png", "/tattoos/tat_hand_ink.png"])

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

      const name = mesh.name.toLowerCase()
      if (name.includes("tattoo")) {
        const tex = name.includes("leg") ? legTex : handTex
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        // unlit ink overlay so it stays crisp/dark against the glass
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
        mesh.material = skin // glass body
      }
    })

    return root
  }, [scene, legTex, handTex])

  // gentle idle: subtle bob + slow turn so it reads as "alive" while static
  useFrame(({ clock }) => {
    if (!group.current || !idle) return
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
