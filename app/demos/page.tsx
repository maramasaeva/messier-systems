import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Demos | Mara Masaeva - Interactive Project Demos",
  description:
    "Interactive demos of AI and creative technology projects by Mara Masaeva. Try sc_generator, explore generative sound, and more.",
  keywords: [
    "interactive demo",
    "AI demo",
    "generative music",
    "SuperCollider",
    "creative technology",
    "Mara Masaeva",
  ],
  openGraph: {
    title: "Demos | Mara Masaeva",
    description:
      "Interactive demos of AI and creative technology projects.",
    url: "https://messier-systems.vercel.app/demos",
    siteName: "messier systems",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demos | Mara Masaeva",
    description: "Interactive demos of AI and creative technology projects.",
    site: "@rssmrm",
    creator: "@rssmrm",
  },
  alternates: {
    canonical: "https://messier-systems.vercel.app/demos",
  },
}

const demos = [
  {
    slug: "sc-generator",
    title: "sc_generator",
    description:
      "type a poem. watch it become sound. an interactive demo of the poem-to-supercollider pipeline - emotional analysis, audio matching, and live code generation.",
    tags: ["python", "supercollider", "pytorch", "generative music"],
    status: "live" as const,
  },
]

export default function DemosPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a08",
        color: "#ddddd8",
        fontFamily: "'DM Mono', 'Courier New', monospace",
      }}
    >
      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } } .cursor { display: inline-block; animation: blink 1s step-end infinite; }`}</style>

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
          <a href="/uses" style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#555550", textDecoration: "none" }}>
            uses
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
          messier@terminal:~/demos$
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
          demos<span className="cursor" style={{ color: "#c8f060", marginLeft: "4px" }}>_</span>
        </h1>
        <p style={{ marginTop: "1rem", fontSize: "1rem", lineHeight: 1.8, color: "#888880", maxWidth: "600px" }}>
          interactive experiments. try the things i build.
        </p>
      </section>

      <hr style={{ border: "none", borderTop: "0.5px solid #222220", margin: 0 }} />

      {/* demo cards */}
      <section style={{ maxWidth: "800px", padding: "2rem" }}>
        {demos.map((demo) => (
          <a
            key={demo.slug}
            href={`/demos/${demo.slug}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <article
              style={{
                borderBottom: "0.5px solid #222220",
                padding: "2rem 0",
                transition: "background 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.2rem", color: "#f0f0ea", fontWeight: 400, margin: 0 }}>
                  {demo.title}
                </h2>
                <span
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase" as const,
                    padding: "2px 8px",
                    border: `0.5px solid ${demo.status === "live" ? "#c8f060" : "#222220"}`,
                    color: demo.status === "live" ? "#c8f060" : "#555550",
                  }}
                >
                  {demo.status}
                </span>
              </div>
              <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", lineHeight: 1.8, color: "#888880", maxWidth: "560px" }}>
                {demo.description}
              </p>
              <div style={{ marginTop: "0.75rem", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {demo.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "10px",
                      color: "#555550",
                      padding: "2px 6px",
                      border: "0.5px solid #222220",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span style={{ display: "inline-block", marginTop: "1rem", fontSize: "11px", color: "#c8f060" }}>
                try it →
              </span>
            </article>
          </a>
        ))}
      </section>

      {/* footer */}
      <section style={{ padding: "2rem 2rem 4rem", maxWidth: "800px" }}>
        <p style={{ fontSize: "11px", color: "#555550", letterSpacing: "0.08em" }}>
          messier@terminal:~/demos$ <span style={{ color: "#c8f060" }}>_</span>
        </p>
      </section>
    </main>
  )
}
