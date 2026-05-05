import { ImageResponse } from "next/og"

export const runtime = "nodejs"
export const alt = "Mara Masaeva - AI Engineer & Creative Technologist"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a08",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "16px", color: "#555550", letterSpacing: "0.2em" }}>
            messier@terminal:~$
          </div>
          <div style={{ fontSize: "48px", color: "#f0f0ea", lineHeight: 1.2, display: "flex" }}>
            mara masaeva
          </div>
          <div style={{ fontSize: "28px", color: "#c8f060", lineHeight: 1.4, display: "flex" }}>
            ai engineer + music producer + writer
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#888880",
              lineHeight: 1.6,
              marginTop: "16px",
              maxWidth: "800px",
              display: "flex",
            }}
          >
            building production ai systems, generative sound, and agentic architectures
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "80px",
            fontSize: "16px",
            color: "#555550",
            display: "flex",
            gap: "32px",
          }}
        >
          <span>leuven, belgium</span>
          <span style={{ color: "#8aaa30" }}>messier-systems.vercel.app</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
