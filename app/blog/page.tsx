import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog | Mara Masaeva — Writing on AI, Sound & Theory",
  description:
    "Prose poetry, theory-fiction, and writing on AI, sound systems, queerness, cybernetics, and digital-physical collapse by Mara Masaeva.",
  keywords: [
    "Mara Masaeva blog",
    "AI writing",
    "theory-fiction",
    "prose poetry",
    "creative technology writing",
    "messinecessity",
    "substack",
  ],
  openGraph: {
    title: "Blog | Mara Masaeva",
    description:
      "Prose poetry, theory-fiction, and writing on AI, sound, queerness, and cybernetics.",
    url: "https://messier-systems.vercel.app/blog",
    siteName: "messier systems",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Mara Masaeva",
    description:
      "Prose poetry, theory-fiction, and writing on AI, sound, queerness, and cybernetics.",
    site: "@rssmrm",
    creator: "@rssmrm",
  },
  alternates: {
    canonical: "https://messier-systems.vercel.app/blog",
  },
}

interface SubstackPost {
  title: string
  link: string
  pubDate: string
  description?: string
}

async function getSubstackPosts(): Promise<SubstackPost[]> {
  try {
    const res = await fetch("https://messinecessity.substack.com/feed", {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []

    const xml = await res.text()
    const items: SubstackPost[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1]
      const title =
        itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
        itemXml.match(/<title>(.*?)<\/title>/)?.[1] ||
        ""
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ""
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ""
      const description =
        itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ||
        itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] ||
        ""

      if (title) {
        items.push({ title, link, pubDate, description: stripHtml(description).slice(0, 280) })
      }
    }

    return items
  } catch {
    return []
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  } catch {
    return dateString
  }
}

export default async function BlogPage() {
  const posts = await getSubstackPosts()

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
          messier@terminal:~/blog$
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
          writing
        </h1>
        <p style={{ marginTop: "1rem", fontSize: "1rem", lineHeight: 1.8, color: "#888880", maxWidth: "600px" }}>
          prose poetry and theory-fiction published on substack under{" "}
          <a
            href="https://substack.com/@maramessier"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#c8f060", textDecoration: "none", borderBottom: "0.5px solid #8aaa30" }}
          >
            messinecessity
          </a>
          . themes: queerness as ontology, network theory, cybernetics, hyperstition, digital-physical collapse.
        </p>
      </section>

      <hr style={{ border: "none", borderTop: "0.5px solid #222220", margin: 0 }} />

      {/* posts */}
      <section style={{ maxWidth: "800px", padding: "2rem" }}>
        {posts.length > 0 ? (
          posts.map((post, i) => (
            <article key={i} style={{ borderBottom: "0.5px solid #222220", padding: "2rem 0" }}>
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <h2 style={{ fontSize: "1.1rem", color: "#f0f0ea", fontWeight: 400, margin: 0, lineHeight: 1.4 }}>
                  {post.title}
                </h2>
              </a>
              <p style={{ marginTop: "0.5rem", fontSize: "11px", color: "#555550" }}>
                {formatDate(post.pubDate)}
              </p>
              {post.description && (
                <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", lineHeight: 1.8, color: "#888880", maxWidth: "560px" }}>
                  {post.description}...
                </p>
              )}
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "0.75rem",
                  fontSize: "11px",
                  color: "#c8f060",
                  textDecoration: "none",
                  borderBottom: "0.5px solid #8aaa30",
                }}
              >
                read on substack →
              </a>
            </article>
          ))
        ) : (
          <p style={{ padding: "2rem 0", color: "#555550", fontSize: "0.9rem" }}>
            loading posts...
          </p>
        )}
      </section>

      {/* footer */}
      <section style={{ padding: "2rem 2rem 4rem", maxWidth: "800px" }}>
        <p style={{ fontSize: "11px", color: "#555550", letterSpacing: "0.08em" }}>
          messier@terminal:~/blog$ <span style={{ color: "#c8f060" }}>_</span>
        </p>
      </section>
    </main>
  )
}
