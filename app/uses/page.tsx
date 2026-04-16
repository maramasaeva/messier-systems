import type { Metadata } from "next"
import { epkData } from "@/data/epk"

export const metadata: Metadata = {
  title: "Uses | Mara Masaeva — Tools & Stack",
  description:
    "The tools, languages, frameworks, and infrastructure Mara Masaeva uses for AI engineering, music production, and creative technology.",
  keywords: [
    "AI engineer tools",
    "developer setup",
    "MCP server stack",
    "Python tools",
    "TypeScript tools",
    "uses page",
    "Mara Masaeva",
  ],
  openGraph: {
    title: "Uses | Mara Masaeva — Tools & Stack",
    description:
      "Tools, languages, frameworks, and infrastructure for AI engineering and creative technology.",
    url: "https://messier-systems.vercel.app/uses",
    siteName: "messier systems",
  },
  twitter: {
    card: "summary_large_image",
    title: "Uses | Mara Masaeva — Tools & Stack",
    description:
      "Tools, languages, frameworks, and infrastructure for AI engineering and creative technology.",
    site: "@rssmrm",
    creator: "@rssmrm",
  },
  alternates: {
    canonical: "https://messier-systems.vercel.app/uses",
  },
}

const sections = [
  { label: "languages", items: epkData.skills.languages },
  { label: "human languages", items: epkData.skills.humanLanguages },
  { label: "frameworks + libraries", items: epkData.skills.frameworks },
  { label: "infrastructure", items: epkData.skills.infrastructure },
  { label: "tools + editors", items: epkData.skills.tools },
  { label: "core competencies", items: epkData.skills.core },
]

export default function UsesPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a08",
        color: "#ddddd8",
        fontFamily: "'DM Mono', 'Courier New', monospace",
      }}
    >
      {/* nav */}
      <nav
        style={{
          borderBottom: "0.5px solid #222220",
          padding: "1.25rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <a
          href="/"
          style={{
            fontSize: "11px",
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
            color: "#c8f060",
            textDecoration: "none",
          }}
        >
          ← messier.exe
        </a>
        <div style={{ display: "flex", gap: "2rem" }}>
          <a href="/projects" style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#555550", textDecoration: "none" }}>
            projects
          </a>
          <a href="/blog" style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#555550", textDecoration: "none" }}>
            blog
          </a>
          <a href="/resume" style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#555550", textDecoration: "none" }}>
            resume
          </a>
          <a href="/think" style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#555550", textDecoration: "none" }}>
            think
          </a>
        </div>
      </nav>

      {/* header */}
      <section style={{ padding: "4rem 2rem 3rem", maxWidth: "800px" }}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "#555550",
            marginBottom: "1.5rem",
          }}
        >
          messier@terminal:~/uses$
        </p>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
            fontWeight: 400,
            lineHeight: 1.2,
            color: "#f0f0ea",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          uses
        </h1>
        <p style={{ marginTop: "1rem", fontSize: "1rem", lineHeight: 1.8, color: "#888880", maxWidth: "600px" }}>
          the tools, languages, and systems i work with. updated as my stack evolves.
        </p>
      </section>

      <hr style={{ border: "none", borderTop: "0.5px solid #222220", margin: 0 }} />

      {/* sections */}
      <section style={{ maxWidth: "800px", padding: "2rem" }}>
        {sections.map((section) => (
          <div key={section.label} style={{ borderBottom: "0.5px solid #222220", padding: "2rem 0" }}>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
                color: "#555550",
                marginBottom: "1rem",
              }}
            >
              {section.label}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {section.items.map((item) => (
                <span
                  key={item}
                  style={{
                    fontSize: "0.85rem",
                    color: "#ddddd8",
                    padding: "4px 12px",
                    border: "0.5px solid #222220",
                    lineHeight: 1.6,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* music tools */}
      <hr style={{ border: "none", borderTop: "0.5px solid #222220", margin: 0 }} />
      <section style={{ maxWidth: "800px", padding: "2rem" }}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "#555550",
            marginBottom: "1rem",
          }}
        >
          music production
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {["ableton live", "sonic pi", "supercollider", "praat", "audacity", "splice", "midi controllers"].map((item) => (
            <span
              key={item}
              style={{
                fontSize: "0.85rem",
                color: "#ddddd8",
                padding: "4px 12px",
                border: "0.5px solid #222220",
                lineHeight: 1.6,
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* footer */}
      <section style={{ padding: "2rem 2rem 4rem", maxWidth: "800px" }}>
        <p style={{ fontSize: "11px", color: "#555550", letterSpacing: "0.08em" }}>
          messier@terminal:~/uses$ <span style={{ color: "#c8f060" }}>_</span>
        </p>
      </section>
    </main>
  )
}
