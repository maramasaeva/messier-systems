import { ImageResponse } from "next/og"

export const runtime = "nodejs"
export const alt = "AI Ethics & Literacy — Mara Masaeva"
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
            messier@terminal:~/think$
          </div>
          <div style={{ fontSize: "44px", color: "#f0f0ea", lineHeight: 1.2, display: "flex" }}>
            i work in AI.
          </div>
          <div style={{ fontSize: "44px", color: "#888880", lineHeight: 1.2, display: "flex" }}>
            {"that's why i'm saying this."}
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#c8f060",
              lineHeight: 1.6,
              marginTop: "24px",
              display: "flex",
            }}
          >
            on thinking, tools, and what we owe the next generation
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
          <span>workshops + talks available</span>
          <span style={{ color: "#8aaa30" }}>messier-systems.vercel.app/think</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
