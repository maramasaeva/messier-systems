"use client"

import { Html } from "@react-three/drei"
import { useState } from "react"

/**
 * A single, near-invisible M42 hotspot hidden in the misty sky.
 * It barely registers visually — its name only surfaces on hover.
 */
export default function MessierSky() {
  const [hover, setHover] = useState(false)

  return (
    <group position={[-13, 6, -15]}>
      {/* generous invisible hover target */}
      <mesh
        visible={false}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          setHover(false)
          document.body.style.cursor = "auto"
        }}
      >
        <sphereGeometry args={[3.5, 16, 16]} />
      </mesh>

      {/* faint, almost-invisible presence */}
      <mesh>
        <sphereGeometry args={[1.3, 24, 24]} />
        <meshBasicMaterial
          color="#e4e9f1"
          transparent
          opacity={hover ? 0.18 : 0.05}
          depthWrite={false}
        />
      </mesh>

      {hover && (
        <Html center style={{ pointerEvents: "none" }}>
          <div className="messier-label">
            <span className="messier-label__id">M42</span>
            <span className="messier-label__name">orion nebula</span>
          </div>
        </Html>
      )}
    </group>
  )
}
