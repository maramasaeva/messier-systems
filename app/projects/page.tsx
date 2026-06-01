import type { Metadata } from "next"
import { epkData } from "@/data/epk"
import BackLink from "@/components/BackLink"

export const metadata: Metadata = {
  title: "Projects | Mara Masaeva - AI Engineer",
  description:
    "AI and creative technology projects by Mara Masaeva: MCP servers, agentic architectures, AI companions, generative sound systems, moral AI, and more.",
  keywords: [
    "AI projects",
    "MCP servers",
    "agentic architecture",
    "Kaios AI companion",
    "generative sound",
    "moral AI",
    "Mara Masaeva",
    "creative technology",
  ],
  openGraph: {
    title: "Projects | Mara Masaeva - AI Engineer",
    description:
      "AI and creative technology projects: MCP servers, agentic architectures, AI companions, generative sound systems.",
    url: "https://messier-systems.vercel.app/projects",
    siteName: "messier systems",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Mara Masaeva - AI Engineer",
    description:
      "AI and creative technology projects: MCP servers, agentic architectures, AI companions, generative sound.",
    site: "@rssmrm",
    creator: "@rssmrm",
  },
  alternates: {
    canonical: "https://messier-systems.vercel.app/projects",
  },
}

export default function ProjectsPage() {
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
        <BackLink
          style={{
            fontSize: "11px",
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
            color: "#c8f060",
            textDecoration: "none",
          }}
        >
          ← messier.exe
        </BackLink>
        <div style={{ display: "flex", gap: "2rem" }}>
          <a href="/security" style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#555550", textDecoration: "none" }}>
            security
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
          messier@terminal:~/projects$
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
          projects<span className="cursor" style={{ color: "#c8f060", marginLeft: "4px" }}>_</span>
        </h1>
        <p style={{ marginTop: "1rem", fontSize: "1rem", lineHeight: 1.8, color: "#888880", maxWidth: "600px" }}>
          a selection of things i've built. production systems, research projects, creative experiments.
        </p>
      </section>

      <hr style={{ border: "none", borderTop: "0.5px solid #222220", margin: 0 }} />

      {/* projects */}
      <section style={{ maxWidth: "800px", padding: "2rem" }}>
        {epkData.tech.map((project, i) => (
          <article
            key={i}
            style={{
              borderBottom: "0.5px solid #222220",
              padding: "2rem 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "1.1rem", color: "#f0f0ea", fontWeight: 400, margin: 0 }}>
                {project.project}
              </h2>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "11px",
                    color: "#c8f060",
                    textDecoration: "none",
                    borderBottom: "0.5px solid #8aaa30",
                  }}
                >
                  {project.url.includes("github.com") ? "github" : "link"} →
                </a>
              )}
              {"role" in project && project.role && (
                <span style={{ fontSize: "11px", color: "#555550", letterSpacing: "0.1em" }}>
                  {project.role}
                </span>
              )}
            </div>
            <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", lineHeight: 1.8, color: "#888880", maxWidth: "560px" }}>
              {project.description}
            </p>
          </article>
        ))}

        {/* additional projects not in epk.tech */}
        <article style={{ borderBottom: "0.5px solid #222220", padding: "2rem 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "1.1rem", color: "#f0f0ea", fontWeight: 400, margin: 0 }}>
              sc_generator
            </h2>
            <a
              href="https://github.com/maramasaeva/sc_generator"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "11px", color: "#c8f060", textDecoration: "none", borderBottom: "0.5px solid #8aaa30" }}
            >
              github →
            </a>
          </div>
          <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", lineHeight: 1.8, color: "#888880", maxWidth: "560px" }}>
            a supercollider code generator for poets, programmers, artists, and engineers. uses python to generate real-time audio synthesis code in supercollider. bridges programmatic generation with live sound.
          </p>
        </article>

        <article style={{ borderBottom: "0.5px solid #222220", padding: "2rem 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "1.1rem", color: "#f0f0ea", fontWeight: 400, margin: 0 }}>
              messier-systems
            </h2>
            <a
              href="https://github.com/maramasaeva/messier-systems"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "11px", color: "#c8f060", textDecoration: "none", borderBottom: "0.5px solid #8aaa30" }}
            >
              github →
            </a>
          </div>
          <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", lineHeight: 1.8, color: "#888880", maxWidth: "560px" }}>
            this website. next.js, typescript, tailwind. interactive terminal ui with draggable windows, spotify integration, real-time activity aggregation from github, substack, bandcamp, and strava.
          </p>
        </article>
      </section>

      {/* music projects */}
      <hr style={{ border: "none", borderTop: "0.5px solid #222220", margin: 0 }} />
      <section style={{ maxWidth: "800px", padding: "2rem" }}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "#555550",
            marginBottom: "2rem",
          }}
        >
          music releases
        </p>
        {epkData.music.releases.map((release, i) => (
          <article key={i} style={{ borderBottom: "0.5px solid #222220", padding: "1.5rem 0" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", color: "#f0f0ea", fontWeight: 400, margin: 0 }}>
                {release.title}
              </h2>
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  padding: "2px 8px",
                  border: "0.5px solid #222220",
                  color: "#555550",
                }}
              >
                {release.type}
              </span>
              <span style={{ fontSize: "11px", color: "#555550" }}>{release.date}</span>
            </div>
            {release.description && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", lineHeight: 1.8, color: "#888880" }}>
                {release.description}
              </p>
            )}
          </article>
        ))}
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "2rem" }}>
          <a href={epkData.music.streaming.bandcamp} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#c8f060", textDecoration: "none" }}>
            bandcamp →
          </a>
          <a href={epkData.music.streaming.spotify} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#c8f060", textDecoration: "none" }}>
            spotify →
          </a>
        </div>
      </section>

      {/* footer */}
      <section style={{ padding: "2rem 2rem 4rem", maxWidth: "800px" }}>
        <p style={{ fontSize: "11px", color: "#555550", letterSpacing: "0.08em" }}>
          messier@terminal:~/projects$ <span style={{ color: "#c8f060" }}>_</span>
        </p>
      </section>
    </main>
  )
}
