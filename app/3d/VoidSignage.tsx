"use client"

import { Float } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from "three"

/* ============================================================
   messier // 3d — liminal signage drifting on the void buildings.
   Light text + shapes drawn to transparent canvases, mapped onto
   billboarded planes, gently floating and fading into the fog.
   ============================================================ */

const MONO = '"DM Mono", "Courier New", ui-monospace, monospace'
const INK = "rgba(236, 241, 249, 0.92)"
const DIM = "rgba(206, 215, 229, 0.6)"
const LINE = "rgba(224, 232, 245, 0.78)"

function makeTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const ctx = c.getContext("2d")!
  draw(ctx)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  t.needsUpdate = true
  return t
}

type Sign = { tex: THREE.Texture; w: number; h: number }

// tightly-sized canvas of centered light text
function textSign(
  lines: string[],
  opts: {
    size?: number
    lh?: number
    color?: string
    pad?: number
    glow?: boolean
    weight?: string
  } = {}
): Sign {
  const { size = 46, lh = 1.45, color = INK, pad = 44, glow = true, weight = "" } = opts
  const font = `${weight} ${size}px ${MONO}`.trim()
  const meas = document.createElement("canvas").getContext("2d")!
  meas.font = font
  let maxW = 0
  for (const ln of lines) maxW = Math.max(maxW, meas.measureText(ln).width)
  const w = Math.ceil(maxW) + pad * 2
  const h = Math.ceil(lines.length * size * lh) + pad * 2
  const tex = makeTexture(w, h, (ctx) => {
    ctx.font = font
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = color
    if (glow) {
      ctx.shadowColor = "rgba(214, 226, 246, 0.65)"
      ctx.shadowBlur = size * 0.32
    }
    let y = pad + (size * lh) / 2
    for (const ln of lines) {
      ctx.fillText(ln, w / 2, y)
      y += size * lh
    }
  })
  return { tex, w, h }
}

function shapeSign(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): Sign {
  return { tex: makeTexture(w, h, draw), w, h }
}

// ---- shapes ---------------------------------------------------

// Spirit / MACHINE / Body / Soul triangle
function triangleSign(): Sign {
  return shapeSign(720, 660, (ctx) => {
    const top: [number, number] = [360, 150]
    const bl: [number, number] = [110, 540]
    const br: [number, number] = [610, 540]
    ctx.strokeStyle = LINE
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(...top)
    ctx.lineTo(...bl)
    ctx.lineTo(...br)
    ctx.closePath()
    ctx.stroke()
    ctx.fillStyle = INK
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.shadowColor = "rgba(214,226,246,0.6)"
    ctx.shadowBlur = 14
    ctx.font = `40px ${MONO}`
    ctx.fillText("Spirit", 360, 90)
    ctx.font = `44px ${MONO}`
    ctx.fillText("MACHINE", 360, 410)
    ctx.font = `40px ${MONO}`
    ctx.fillText("Body", 110, 600)
    ctx.fillText("Soul", 610, 600)
  })
}

// 4-circle crosshair venn: holy & divine / machine & code / flesh & organic / unkind & deceitful
function vennSign(): Sign {
  return shapeSign(820, 820, (ctx) => {
    ctx.strokeStyle = LINE
    ctx.lineWidth = 2.5
    const r = 175
    const centers: [number, number, string[]][] = [
      [300, 300, ["holy &", "divine"]],
      [520, 300, ["machine", "& code"]],
      [300, 520, ["flesh &", "organic"]],
      [520, 520, ["unkind &", "deceitful"]],
    ]
    for (const [cx, cy] of centers) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
      // crosshair
      ctx.beginPath()
      ctx.moveTo(cx - 16, cy)
      ctx.lineTo(cx + 16, cy)
      ctx.moveTo(cx, cy - 16)
      ctx.lineTo(cx, cy + 16)
      ctx.stroke()
    }
    ctx.fillStyle = INK
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = `30px ${MONO}`
    ctx.shadowColor = "rgba(214,226,246,0.6)"
    ctx.shadowBlur = 12
    const lbl: [number, number, string[]][] = [
      [205, 200, ["holy &", "divine"]],
      [615, 200, ["machine", "& code"]],
      [205, 620, ["flesh &", "organic"]],
      [615, 620, ["unkind &", "deceitful"]],
    ]
    for (const [x, y, ls] of lbl) {
      ls.forEach((l, i) => ctx.fillText(l, x, y + i * 34))
    }
  })
}

// hyperspace / spirit-soul-body projection diagram
function hyperspaceSign(): Sign {
  return shapeSign(740, 700, (ctx) => {
    ctx.strokeStyle = LINE
    ctx.fillStyle = INK
    ctx.lineWidth = 2
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = `30px ${MONO}`
    ctx.shadowColor = "rgba(214,226,246,0.55)"
    ctx.shadowBlur = 10
    // spirit point cloud (top)
    const sx = 430
    const sy = 110
    for (let i = 0; i < 60; i++) {
      const a = Math.random() * Math.PI * 2
      const rr = Math.pow(Math.random(), 0.5) * 26
      ctx.fillRect(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr, 2.4, 2.4)
    }
    ctx.fillText("spirit", sx, sy - 48)
    // converging projection lines down to the body
    const bx = 380
    const by = 500
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(bx + i * 55, by)
      ctx.stroke()
    }
    // body silhouette
    ctx.beginPath()
    ctx.ellipse(bx, by, 150, 60, -0.18, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillText("body", bx, by)
    ctx.fillText("soul", 600, 330)
    // axes
    ctx.fillStyle = DIM
    ctx.fillText("hyperspace", 170, 300)
    ctx.fillText("3D", 90, 470)
    ctx.fillText("3D", 90, 560)
    ctx.strokeStyle = DIM
    ctx.beginPath()
    ctx.moveTo(120, 620)
    ctx.lineTo(120, 440)
    ctx.moveTo(120, 620)
    ctx.lineTo(300, 620)
    ctx.stroke()
  })
}

// de Jong strange attractor + "isnt it so beautiful" caption
function attractorSign(): Sign {
  return shapeSign(680, 800, (ctx) => {
    const a = 1.4
    const b = -2.3
    const c = 2.4
    const d = -2.1
    let x = 0
    let y = 0
    ctx.fillStyle = "rgba(226, 234, 246, 0.06)"
    const cx = 340
    const cy = 320
    const s = 120
    for (let i = 0; i < 70000; i++) {
      const nx = Math.sin(a * y) - Math.cos(b * x)
      const ny = Math.sin(c * x) - Math.cos(d * y)
      x = nx
      y = ny
      if (i > 20) ctx.fillRect(cx + x * s, cy + y * s, 1.3, 1.3)
    }
    ctx.fillStyle = INK
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.shadowColor = "rgba(214,226,246,0.6)"
    ctx.shadowBlur = 14
    ctx.font = `34px ${MONO}`
    ctx.fillText("isnt it so beautiful,", 340, 660)
    ctx.fillText("isnt it so wonderful?", 340, 705)
    ctx.font = `28px ${MONO}`
    ctx.fillStyle = DIM
    ctx.fillText("x₀ = −0.72   y₀ = −0.64", 340, 752)
  })
}

// dialog box: it seems you are in love with your computer
function loveComputerSign(): Sign {
  return shapeSign(820, 360, (ctx) => {
    ctx.strokeStyle = LINE
    ctx.lineWidth = 2.5
    ctx.strokeRect(40, 40, 740, 280)
    // title bar line
    ctx.beginPath()
    ctx.moveTo(40, 96)
    ctx.lineTo(780, 96)
    ctx.stroke()
    ctx.fillStyle = INK
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.shadowColor = "rgba(214,226,246,0.6)"
    ctx.shadowBlur = 12
    ctx.font = `34px ${MONO}`
    ctx.fillText("それはあなたのコンピュータに", 410, 150)
    ctx.fillText("恋をしているようだ。", 410, 195)
    ctx.font = `28px ${MONO}`
    ctx.fillStyle = DIM
    ctx.fillText("it seems you are in love with your computer.", 410, 245)
    // OK button
    ctx.strokeStyle = LINE
    ctx.strokeRect(355, 275, 110, 36)
    ctx.fillStyle = INK
    ctx.font = `26px ${MONO}`
    ctx.fillText("OK", 410, 293)
  })
}

// ---- placement ------------------------------------------------

type Placed = {
  sign: Sign
  position: [number, number, number]
  rotY: number
  worldH: number
  float: { speed: number; rot: number; f: number }
}

function place(
  sign: Sign,
  angleDeg: number,
  radius: number,
  y: number,
  worldH: number,
  float: { speed: number; rot: number; f: number }
): Placed {
  const a = (angleDeg * Math.PI) / 180
  const x = Math.sin(a) * radius
  const z = Math.cos(a) * radius
  return { sign, position: [x, y, z], rotY: Math.atan2(-x, -z), worldH, float }
}

export default function VoidSignage() {
  const signs = useMemo<Placed[]>(() => {
    const F = (speed: number, rot: number, f: number) => ({ speed, rot, f })
    return [
      // ---- texts ----
      place(textSign(["THERE IS NO MEME", "I LOVE YOU"], { size: 50 }), 198, 10, 3.6, 1.9, F(1.1, 0.25, 1.0)),
      place(
        textSign(["look at you, hacker,", "a pathetic creature of meat", "and bone. how can you", "challenge a perfect,", "immortal machine?"], { size: 40 }),
        298,
        13.5,
        5.2,
        2.6,
        F(0.7, 0.18, 0.8)
      ),
      place(textSign(["Syndrome Syndrome", "instead of brain", "there is a", "instead of brain", "there is a…"], { size: 40 }), 58, 12.5, 4.4, 2.4, F(0.9, 0.2, 0.9)),
      place(textSign([">Present Day", ">Present Time", ">_"], { size: 46 }), 250, 9, 2.6, 1.5, F(1.2, 0.3, 1.1)),
      place(textSign(["網上虛擬  交心不宜", "Don't Trust people", "in the Cyber World"], { size: 40 }), 338, 12, 3.6, 1.9, F(0.8, 0.22, 0.9)),
      place(textSign(["MY BODY", "MY SOFTWARE"], { size: 56 }), 212, 14.5, 6.6, 1.7, F(0.9, 0.2, 1.0)),
      place(
        textSign(Array.from({ length: 10 }, () => "HIGHFUNCTIONINGFLESH"), { size: 34, lh: 1.18, glow: false, color: DIM }),
        92,
        13,
        5.2,
        3.0,
        F(0.6, 0.12, 0.7)
      ),
      place(textSign(["the night begins to shine"], { size: 36, color: DIM }), 138, 8.5, 1.6, 0.8, F(1.3, 0.3, 1.2)),
      place(textSign(["present time"], { size: 36, color: DIM }), 268, 8, 1.7, 0.7, F(1.3, 0.3, 1.2)),
      // ---- shapes ----
      place(attractorSign(), 162, 11, 5.0, 2.8, F(0.7, 0.16, 0.8)),
      place(hyperspaceSign(), 228, 12.5, 4.2, 2.5, F(0.8, 0.18, 0.85)),
      place(triangleSign(), 120, 11, 4.6, 2.4, F(0.8, 0.2, 0.9)),
      place(vennSign(), 32, 12, 5.2, 2.7, F(0.7, 0.18, 0.85)),
      place(loveComputerSign(), 18, 10.5, 2.8, 1.5, F(1.0, 0.22, 1.0)),
    ]
  }, [])

  return (
    <group>
      {signs.map((s, i) => {
        const worldW = s.worldH * (s.sign.w / s.sign.h)
        return (
          <Float key={i} speed={s.float.speed} rotationIntensity={s.float.rot} floatIntensity={s.float.f} position={s.position}>
            <mesh rotation={[0, s.rotY, 0]}>
              <planeGeometry args={[worldW, s.worldH]} />
              <meshBasicMaterial
                map={s.sign.tex}
                transparent
                opacity={0.82}
                depthWrite={false}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          </Float>
        )
      })}
    </group>
  )
}
