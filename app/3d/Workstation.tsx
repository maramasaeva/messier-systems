"use client"

import dynamic from "next/dynamic"
import { Loader } from "@react-three/drei"
import "./crt.css"

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => (
    <div className="boot-loader">
      <span className="boot-loader__cursor">messier systems — initializing display</span>
    </div>
  ),
})

export default function Workstation() {
  return (
    <main className="fixed inset-0 bg-black overflow-hidden select-none">
      <Scene />
      <Loader
        containerStyles={{ background: "#c6cbd3" }}
        innerStyles={{ background: "#aeb4bf", width: 200, height: 3 }}
        barStyles={{ background: "#20242c", height: 3 }}
        dataStyles={{
          color: "#20242c",
          fontFamily: "var(--font-dm-mono), ui-monospace, monospace",
          fontSize: 12,
          letterSpacing: "0.18em",
        }}
        dataInterpolation={(p) => `materializing the void — ${p.toFixed(0)}%`}
      />
      <div className="ws-hint">
        drag to look around · scroll to pull back into the void · look up for stars
      </div>
    </main>
  )
}
