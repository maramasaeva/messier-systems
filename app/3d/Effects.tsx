"use client"

import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing"

export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.4}
        mipmapBlur
        radius={0.7}
      />
      <Vignette eskil={false} offset={0.3} darkness={0.4} />
      <SMAA />
    </EffectComposer>
  )
}
