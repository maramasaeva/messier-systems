import { ImageResponse } from "next/og"

export const runtime = "nodejs"
export const alt = "messier — Electronic Press Kit"
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
            electronic press kit
          </div>
          <div style={{ fontSize: "56px", color: "#f0f0ea", lineHeight: 1.2, display: "flex" }}>
            messier
          </div>
          <div style={{ fontSize: "24px", color: "#c8f060", lineHeight: 1.4, display: "flex" }}>
            idm / ambient / jungle / noise / spoken word
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#888880",
              lineHeight: 1.6,
              marginTop: "16px",
              display: "flex",
            }}
          >
            building sonic systems for feeling machines
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
          <span>mara masaeva — leuven, belgium</span>
          <span style={{ color: "#8aaa30" }}>messier-systems.vercel.app/epk</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
