"use client";

import { useState, useEffect, useRef } from "react";

const glitchChars = "!<>-_\\/[]{}—=+*^?#░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌";

function useGlitch(text: string, active: boolean) {
  const [displayed, setDisplayed] = useState(text);
  const frame = useRef(0);
  useEffect(() => {
    if (!active) { setDisplayed(text); return; }
    let i = 0;
    const interval = setInterval(() => {
      if (i >= 12) { setDisplayed(text); clearInterval(interval); return; }
      setDisplayed(text.split("").map((c, idx) =>
        Math.random() < 0.25 && c !== " " ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : c
      ).join(""));
      i++;
    }, 40);
    return () => clearInterval(interval);
  }, [active, text]);
  return displayed;
}

function GlitchText({ text, className }: { text: string; className?: string }) {
  const [hover, setHover] = useState(false);
  const displayed = useGlitch(text, hover);
  return (
    <span className={className} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {displayed}
    </span>
  );
}

function TypewriterBlock({ lines, delay = 0 }: { lines: string[]; delay?: number }) {
  const [visibleCount, setVisibleCount] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        setVisibleCount(v => { if (v >= lines.length) { clearInterval(interval); return v; } return v + 1; });
      }, 180);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(t);
  }, [lines.length, delay]);
  return (
    <div className="space-y-1">
      {lines.slice(0, visibleCount).map((line, i) => (
        <p key={i} className="font-mono text-sm text-[var(--dim)] leading-relaxed animate-fadeIn">
          {line}
        </p>
      ))}
    </div>
  );
}

const concerns = [
  { id: "01", label: "cognitive offloading", body: "when we outsource thinking before building the capacity to think — we don't augment intelligence, we replace it. research on the google effect (sparrow et al., 2011) and cognitive offloading (risko & gilbert) shows the brain encodes differently when it knows retrieval is external. the question isn't whether tools help. it's what atrophies when we stop doing the hard internal work entirely." },
  { id: "02", label: "children + development", body: "children are being handed intelligence amplification tools before they've built their own intelligence. maryanne wolf's work on deep reading shows how the brain literally rewires itself through effortful cognitive practice. a child who has never learned to sit with a hard problem — who has only ever prompted their way through — is not ready for a collaborative relationship with AI. they're in a dependent one." },
  { id: "03", label: "systems + equity", body: "the costs of uncritical AI adoption are not evenly distributed. safiya umoja noble, virginia eubanks, kate crawford — all document how algorithmic systems encode and amplify existing inequalities. AI literacy is not a neutral skill. it's a question of who gets to understand the systems shaping their lives, and who is just subject to them." },
  { id: "04", label: "the inside view", body: "i work in AI. i help organizations implement it. i build these systems. and that's exactly why i'm saying this — not despite it. i've seen what happens when we skip the part where humans stay in the loop. when speed-to-deployment trumps critical thinking. when the tool becomes the default, not the option." },
];

const offerings = [
  { for: "schools", what: "workshops on AI literacy + critical thinking for students aged 12–18. not 'how does AI work' — how to stay in charge of your own thinking while using powerful tools." },
  { for: "health + welfare orgs", what: "talks on screen dependency, cognitive health, and digital wellbeing grounded in current research. framed for prevention, not panic." },
  { for: "companies", what: "responsible AI introduction — what it means to bring these tools into an organization in a way that augments rather than replaces human judgment." },
  { for: "parents + educators", what: "frameworks for talking to children about AI. how to model critical engagement. how to build the habits that matter before the tools become invisible." },
];

export default function ThinkPage() {
  const [openConcern, setOpenConcern] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <main className="think-root">
      <style>{`
        :root {
          --bg: #0a0a08;
          --surface: #111110;
          --border: #222220;
          --dim: #555550;
          --mid: #888880;
          --text: #ddddd8;
          --bright: #f0f0ea;
          --accent: #c8f060;
          --accent-dim: #8aaa30;
        }
        .think-root {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Mono', 'Courier New', monospace;
          padding: 0;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
        .cursor { display: inline-block; animation: blink 1s step-end infinite; }
        .scanline {
          pointer-events: none; position: fixed; top: 0; left: 0; right: 0;
          height: 2px; background: rgba(200,240,96,0.03);
          animation: scanline 8s linear infinite; z-index: 100;
        }
        .noise {
          pointer-events: none; position: fixed; inset: 0; z-index: 99;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4;
        }
        .section-divider {
          border: none; border-top: 0.5px solid var(--border); margin: 0;
        }
        .concern-row {
          border-bottom: 0.5px solid var(--border);
          cursor: pointer; transition: background 0.15s;
        }
        .concern-row:hover { background: var(--surface); }
        .concern-body {
          overflow: hidden; transition: max-height 0.35s ease, opacity 0.25s ease;
          max-height: 0; opacity: 0;
        }
        .concern-body.open { max-height: 300px; opacity: 1; }
        .offering-row { border-bottom: 0.5px solid var(--border); }
        .tag {
          display: inline-block; font-size: 10px; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 2px 8px;
          border: 0.5px solid var(--border); color: var(--dim);
          font-family: 'DM Mono', monospace;
        }
        .accent { color: var(--accent); }
        .nav-link {
          font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--dim); text-decoration: none; transition: color 0.15s;
        }
        .nav-link:hover { color: var(--accent); }
        .contact-link {
          color: var(--accent); text-decoration: none; border-bottom: 0.5px solid var(--accent-dim);
          transition: border-color 0.15s;
        }
        .contact-link:hover { border-color: var(--accent); }
        @media (max-width: 640px) {
          .grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="scanline" />
      <div className="noise" />

      {/* nav */}
      <nav style={{ borderBottom: "0.5px solid var(--border)", padding: "1.25rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" className="nav-link" style={{ color: "var(--accent)", letterSpacing: "0.15em" }}>
          ← messier.exe
        </a>
        <div style={{ display: "flex", gap: "2rem" }}>
          <a href="mailto:maramasaeva@gmail.com" className="nav-link">contact</a>
        </div>
      </nav>

      {/* hero */}
      <section style={{ padding: "4rem 2rem 3rem", maxWidth: "800px" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--dim)", marginBottom: "1.5rem" }}>
          messier@terminal:~/think$
          <span className="cursor accent" style={{ marginLeft: "4px" }}>_</span>
        </p>
        {mounted && <TypewriterBlock lines={[
          "executing: on thinking, tools, and what we owe the next generation",
        ]} />}
        <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 400, lineHeight: 1.15, marginTop: "2rem", color: "var(--bright)", fontFamily: "'DM Mono', monospace" }}>
          <GlitchText text="i work in AI." />{" "}
          <span style={{ color: "var(--mid)" }}>that's why i'm saying this.</span>
        </h1>
        <p style={{ marginTop: "1.5rem", fontSize: "1rem", lineHeight: 1.8, color: "var(--mid)", maxWidth: "600px" }}>
          i'm a nonbinary AI engineer building systems at the intersection of intelligence, creativity, and care. and i've become increasingly convinced that the way we're introducing these tools — especially to children — is doing quiet, serious harm.
        </p>
        <p style={{ marginTop: "1rem", fontSize: "1rem", lineHeight: 1.8, color: "var(--mid)", maxWidth: "600px" }}>
          this page is for anyone who wants to think about that with me — or bring me in to think about it with others.
        </p>
      </section>

      <hr className="section-divider" />

      {/* concerns */}
      <section style={{ maxWidth: "800px", padding: "3rem 2rem" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--dim)", marginBottom: "2rem" }}>
          what concerns me <span className="accent">// expand to read</span>
        </p>
        {concerns.map((c) => (
          <div key={c.id} className="concern-row" onClick={() => setOpenConcern(openConcern === c.id ? null : c.id)}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "1.5rem", padding: "1.25rem 0" }}>
              <span style={{ fontSize: "11px", color: "var(--dim)", flexShrink: 0 }}>{c.id}</span>
              <span style={{ fontSize: "0.95rem", color: openConcern === c.id ? "var(--accent)" : "var(--text)", transition: "color 0.15s" }}>
                {c.label}
              </span>
              <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--dim)" }}>
                {openConcern === c.id ? "−" : "+"}
              </span>
            </div>
            <div className={`concern-body${openConcern === c.id ? " open" : ""}`}>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.8, color: "var(--mid)", paddingBottom: "1.5rem", paddingLeft: "2.5rem", maxWidth: "560px" }}>
                {c.body}
              </p>
            </div>
          </div>
        ))}
      </section>

      <hr className="section-divider" />

      {/* what i offer */}
      <section style={{ maxWidth: "800px", padding: "3rem 2rem" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--dim)", marginBottom: "2rem" }}>
          what i offer
        </p>
        {offerings.map((o, i) => (
          <div key={i} className="offering-row" style={{ padding: "1.25rem 0", display: "grid", gridTemplateColumns: "180px 1fr", gap: "2rem", alignItems: "start" }}>
            <span className="tag">{o.for}</span>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "var(--mid)" }}>{o.what}</p>
          </div>
        ))}
      </section>

      <hr className="section-divider" />

      {/* position */}
      <section style={{ maxWidth: "800px", padding: "3rem 2rem" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--dim)", marginBottom: "2rem" }}>
          where i stand
        </p>
        <blockquote style={{ borderLeft: "1px solid var(--accent-dim)", paddingLeft: "1.5rem", margin: 0 }}>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "var(--text)", fontStyle: "normal" }}>
            i am not against AI. i think the human-AI relationship, built right, is one of the most interesting things happening in the world. i want to be part of building it well.
          </p>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "var(--text)", marginTop: "1rem" }}>
            but "built right" means humans come in with something — their own capacity for reasoning, for sitting with difficulty, for being wrong and correcting themselves. children especially need to develop that capacity <em>before</em> they're in a dependent relationship with a system that will do it for them.
          </p>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "var(--text)", marginTop: "1rem" }}>
            that's the work. not fear. not prohibition. <span className="accent">literacy.</span>
          </p>
        </blockquote>
      </section>

      <hr className="section-divider" />

      {/* contact */}
      <section style={{ maxWidth: "800px", padding: "3rem 2rem 5rem" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--dim)", marginBottom: "2rem" }}>
          get in touch
        </p>
        <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "var(--mid)", maxWidth: "520px" }}>
          if you're a school, a health organization, a company, or a person who wants to think about this — reach out. i'm based in belgium, working locally first, but the conversation is open.
        </p>
        <p style={{ marginTop: "1.5rem", fontSize: "0.95rem", color: "var(--mid)" }}>
          →{" "}
          <a href="mailto:maramasaeva@gmail.com" className="contact-link">
            maramasaeva@gmail.com
          </a>
        </p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.95rem", color: "var(--mid)" }}>
          →{" "}
          <a href="https://x.com/rssmrm" className="contact-link" target="_blank" rel="noopener noreferrer">
            twitter / x
          </a>
        </p>
        <p style={{ marginTop: "2rem", fontSize: "11px", color: "var(--dim)", letterSpacing: "0.08em" }}>
          messier@terminal:~/think$ <span className="cursor accent">_</span>
        </p>
      </section>
    </main>
  );
}
