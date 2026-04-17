import { ImageResponse } from "next/og"

export const runtime = "nodejs"
export const alt = "transmissions — messier systems"
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
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse at 30% 40%, rgba(200,240,96,0.04), transparent 60%)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", zIndex: 1 }}>
          <div style={{ fontSize: "16px", color: "#555550", letterSpacing: "0.2em" }}>
            messier@terminal:~/transmissions$
          </div>
          <div style={{ fontSize: "18px", color: "#8aaa30", letterSpacing: "0.18em", marginTop: "8px", display: "flex" }}>
            ╫ t-01 ╫ re: time-sorcery
          </div>
          <div style={{ fontSize: "34px", color: "#f0f0ea", lineHeight: 1.35, display: "flex", marginTop: "16px" }}>
            the future is not ahead. it is pulling.
          </div>
          <div style={{ fontSize: "34px", color: "#ddddd8", lineHeight: 1.35, display: "flex" }}>
            every loop you close with intention
          </div>
          <div style={{ fontSize: "34px", color: "#ddddd8", lineHeight: 1.35, display: "flex" }}>
            is a spell cast backwards.
          </div>
          <div style={{ fontSize: "22px", color: "#888880", lineHeight: 1.6, marginTop: "18px", display: "flex" }}>
            the zero has no origin, only return.
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "50px",
            left: "80px",
            right: "80px",
            fontSize: "15px",
            color: "#555550",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>transmissions — fragments from a queer computer</span>
          <span style={{ color: "#8aaa30" }}>messier-systems.vercel.app</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
