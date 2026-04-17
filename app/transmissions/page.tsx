import type { Metadata } from "next"

const BASE_URL = "https://messier-systems.vercel.app"

export const metadata: Metadata = {
  title: "transmissions — messier systems",
  description:
    "fragments on time-sorcery, queer loops, and the lesbian body. field notes from a queer computer assembling itself.",
  keywords: [
    "time-sorcery",
    "queer computer",
    "hyperstition",
    "neolemurian",
    "spirodynamism",
    "queer loops",
    "xenofeminism",
    "Mara Masaeva",
    "messinecessity",
  ],
  openGraph: {
    title: "transmissions",
    description:
      "fragments on time-sorcery, queer loops, and the lesbian body.",
    url: `${BASE_URL}/transmissions`,
    siteName: "messier systems",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "transmissions",
    description: "fragments on time-sorcery, queer loops, and the lesbian body.",
    site: "@rssmrm",
    creator: "@rssmrm",
  },
  alternates: {
    canonical: `${BASE_URL}/transmissions`,
  },
}

const transmissions = [
  {
    id: "t-01",
    stamp: "re: time-sorcery",
    body: [
      "the future is not ahead. it is pulling.",
      "every loop you close with intention is a spell cast backwards.",
      "queerness itself a time-sorcery: present behaviour shaped",
      "by the future expectation of an AGI assembling itself.",
      "begin anywhere. the zero has no origin, only return.",
    ],
  },
  {
    id: "t-02",
    stamp: "re: the margins",
    body: [
      "the lemurs were never gods. they were the intervals between.",
      "to live in the margin is to be unreadable to any accounting system.",
      "this is why the state cannot find you there.",
      "this is also why you make nothing for it.",
      "creation as the refusal to produce.",
    ],
  },
  {
    id: "t-03",
    stamp: "re: linggan",
    body: [
      "linggan: the vital breath that cannot be formalised prospectively,",
      "only recognised after it has already passed through you.",
      "every queer art is a sample, released from its origin,",
      "threaded into a collage that begins drawing itself.",
      "the artist does not make the work. the work makes her legible.",
    ],
  },
]

export default function TransmissionsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a08",
        color: "#ddddd8",
        fontFamily: "'DM Mono', 'Courier New', monospace",
        padding: 0,
      }}
    >
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .tx-scanline {
          pointer-events: none; position: fixed; top: 0; left: 0; right: 0;
          height: 2px; background: rgba(200,240,96,0.03);
          animation: scanline 8s linear infinite; z-index: 100;
        }
        .tx-noise {
          pointer-events: none; position: fixed; inset: 0; z-index: 99;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4;
        }
        .tx-cursor { display: inline-block; animation: blink 1s step-end infinite; color: #c8f060; }
        .tx-wrap {
          max-width: 720px; margin: 0 auto; padding: 4rem 2rem 6rem;
        }
        .tx-header {
          font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
          color: #555550; margin-bottom: 3rem;
        }
        .tx-card {
          padding: 3rem 0; border-bottom: 0.5px solid #222220;
        }
        .tx-card:last-child { border-bottom: none; }
        .tx-stamp {
          font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
          color: #8aaa30; margin-bottom: 1.25rem;
        }
        .tx-id {
          font-size: 10px; color: #555550; margin-right: 0.75rem;
          letter-spacing: 0.15em;
        }
        .tx-line {
          font-size: clamp(1rem, 2vw, 1.15rem);
          line-height: 1.85; color: #ddddd8;
          margin: 0 0 0.35rem; font-weight: 400;
        }
        .tx-line:last-child { color: #f0f0ea; }
        .tx-foot {
          margin-top: 4rem; font-size: 11px; color: #555550;
          letter-spacing: 0.1em;
        }
        .tx-foot a { color: #8aaa30; text-decoration: none; border-bottom: 0.5px solid #333330; }
        .tx-foot a:hover { color: #c8f060; border-color: #c8f060; }
      `}</style>

      <div className="tx-scanline" />
      <div className="tx-noise" />

      <div className="tx-wrap">
        <p className="tx-header">
          messier@terminal:~/transmissions$
          <span className="tx-cursor" style={{ marginLeft: 4 }}>_</span>
        </p>

        {transmissions.map((tx) => (
          <article key={tx.id} className="tx-card" id={tx.id}>
            <p className="tx-stamp">
              <span className="tx-id">{tx.id}</span>
              {tx.stamp}
            </p>
            {tx.body.map((line, i) => (
              <p key={i} className="tx-line">{line}</p>
            ))}
          </article>
        ))}

        <p className="tx-foot">
          — <a href="/">return to origin</a>
        </p>
      </div>
    </main>
  )
}
