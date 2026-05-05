import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Security Research",
  description:
    "Responsible disclosure and security research by Mara Masaeva. Web application audits, vulnerability discovery, and infrastructure analysis.",
  openGraph: {
    title: "Security Research | Mara Masaeva",
    description:
      "Responsible disclosure and security research. Web application audits, vulnerability discovery, and infrastructure analysis.",
    url: "https://messier-systems.vercel.app/security",
    siteName: "messier systems",
  },
}

const audits = [
  {
    target: "Little Wonderland",
    description: "E-commerce platform. Discovered authentication and authorization flaws in the order management system that allowed placing orders without payment.",
    date: "2025",
    duration: "several sessions",
    findings: null,
    severity: null,
    status: "disclosed",
    highlights: [
      "order database insertion without authentication",
      "payment bypass via direct API manipulation",
      "contacted the team and disclosed all findings",
    ],
    stack: "web application",
    scope: "order API, payment flow, authentication",
  },
  {
    target: "plzdontkillus.com",
    description: "AI safety creator bootcamp by Aella & Ronny Fernandez (Lightcone Infrastructure). Month-long residency in Berkeley for creators making AI doom content.",
    date: "2026-05-05",
    duration: "~10 hours",
    findings: 37,
    severity: { critical: 1, high: 12, medium: 8, low: 5, info: 11 },
    status: "disclosed",
    highlights: [
      "combined CSRF + stored XSS + mass assignment + javascript: URI attack chain",
      "write-only API with zero data leakage (positive finding)",
      "3 denial-of-service crash vectors on single-threaded python server",
      "full infrastructure mapping: Cloudflare → nginx → Python http.server",
      "250+ tests across 5 phases",
    ],
    stack: "Cloudflare, nginx, Python http.server",
    scope: "application API, static frontend, DNS, OSINT",
  },
]

export default function SecurityPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a08",
        color: "#ddddd8",
        fontFamily: "'DM Mono', 'Courier New', monospace",
      }}
    >
      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } } .cursor { display: inline-block; animation: blink 1s step-end infinite; } .audit-card:hover { border-color: #c8f060 !important; }`}</style>

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
          <a href="/think" style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#555550", textDecoration: "none" }}>
            think
          </a>
          <a href="/uses" style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#555550", textDecoration: "none" }}>
            uses
          </a>
        </div>
      </nav>

      <section style={{ padding: "4rem 2rem 2rem", maxWidth: "800px" }}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "#555550",
            marginBottom: "1.5rem",
          }}
        >
          messier@terminal:~/security$
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
          security research<span className="cursor" style={{ color: "#c8f060", marginLeft: "4px" }}>_</span>
        </h1>
        <p style={{ marginTop: "1rem", fontSize: "0.95rem", lineHeight: 1.8, color: "#888880", maxWidth: "620px" }}>
          i like pulling things apart to understand how they work. when i find something broken, i tell the people who built it. all findings below were responsibly disclosed to the affected parties before being listed here.
        </p>
      </section>

      <hr style={{ border: "none", borderTop: "0.5px solid #222220", margin: 0 }} />

      <section style={{ maxWidth: "800px", padding: "2rem" }}>
        {audits.map((audit, i) => (
          <article
            key={i}
            className="audit-card"
            style={{
              border: "0.5px solid #222220",
              borderRadius: "4px",
              padding: "2rem",
              marginBottom: "1.5rem",
              transition: "border-color 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              <h2 style={{ fontSize: "1.2rem", color: "#f0f0ea", fontWeight: 400, margin: 0 }}>
                {audit.target}
              </h2>
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  padding: "2px 8px",
                  border: "0.5px solid #c8f060",
                  color: "#c8f060",
                }}
              >
                {audit.status}
              </span>
              <span style={{ fontSize: "11px", color: "#555550" }}>{audit.date}</span>
            </div>

            <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#888880", margin: "0.75rem 0" }}>
              {audit.description}
            </p>

            {audit.findings && audit.severity && (
              <div style={{ display: "flex", gap: "1.5rem", margin: "1rem 0", flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f0f0ea" }}>{audit.findings}</div>
                  <div style={{ fontSize: "10px", color: "#555550", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>findings</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f85149" }}>{audit.severity.critical}</div>
                  <div style={{ fontSize: "10px", color: "#555550", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>critical</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f0883e" }}>{audit.severity.high}</div>
                  <div style={{ fontSize: "10px", color: "#555550", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>high</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#d29922" }}>{audit.severity.medium}</div>
                  <div style={{ fontSize: "10px", color: "#555550", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>medium</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#3fb950" }}>{audit.severity.low + audit.severity.info}</div>
                  <div style={{ fontSize: "10px", color: "#555550", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>low/info</div>
                </div>
              </div>
            )}

            <div style={{ margin: "1rem 0" }}>
              <p style={{ fontSize: "10px", color: "#555550", textTransform: "uppercase" as const, letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
                highlights
              </p>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", listStyleType: "none" }}>
                {audit.highlights.map((h, j) => (
                  <li key={j} style={{ fontSize: "0.85rem", color: "#aaa8a0", lineHeight: 1.8, position: "relative", paddingLeft: "0.8rem" }}>
                    <span style={{ position: "absolute", left: 0, color: "#c8f060" }}>›</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: "flex", gap: "2rem", marginTop: "1rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "#555550" }}>
                <span style={{ color: "#666" }}>stack:</span> {audit.stack}
              </span>
              <span style={{ fontSize: "11px", color: "#555550" }}>
                <span style={{ color: "#666" }}>scope:</span> {audit.scope}
              </span>
              <span style={{ fontSize: "11px", color: "#555550" }}>
                <span style={{ color: "#666" }}>duration:</span> {audit.duration}
              </span>
            </div>
          </article>
        ))}
      </section>

      <hr style={{ border: "none", borderTop: "0.5px solid #222220", margin: 0 }} />

      <section style={{ padding: "2rem", maxWidth: "800px" }}>
        <p style={{ fontSize: "0.85rem", lineHeight: 1.8, color: "#555550", maxWidth: "560px" }}>
          if you want me to audit something, or if you think i broke something of yours and want to talk about it - reach out. i don't do this to cause harm. i do it because understanding how systems fail is the first step to making them resilient.
        </p>
      </section>

      <section style={{ padding: "1rem 2rem 4rem", maxWidth: "800px" }}>
        <p style={{ fontSize: "11px", color: "#555550", letterSpacing: "0.08em" }}>
          messier@terminal:~/security$ <span style={{ color: "#c8f060" }}>_</span>
        </p>
      </section>
    </main>
  )
}
