"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

const GlitchText = ({ text, intensity = 1 }: { text: string; intensity?: number }) => {
  const [glitchedText, setGlitchedText] = useState(text)

  useEffect(() => {
    setGlitchedText(text)
    const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?~`░▒▓█▀▄▌▐■□▪▫"
    const glitchInterval = setInterval(
      () => {
        const chars = text.split("")
        const glitched = chars.map((char) => {
          if (Math.random() < 0.04 * intensity) {
            return glitchChars[Math.floor(Math.random() * glitchChars.length)]
          }
          return char
        })
        setGlitchedText(glitched.join(""))
        setTimeout(() => setGlitchedText(text), 50 / intensity)
      },
      1200 / intensity + Math.random() * 1000 / intensity,
    )
    return () => clearInterval(glitchInterval)
  }, [text, intensity])

  return <span>{glitchedText}</span>
}

const services = [
  {
    id: "automation",
    title: "ai_automation",
    description: "custom ai workflows that replace manual processes. lead processing, content generation, email personalization, crm integration. you describe the workflow, i build the machine.",
    tags: ["llm integration", "workflow automation", "api orchestration", "data pipelines"],
    price: "from €500",
  },
  {
    id: "mcp",
    title: "mcp_server_development",
    description: "production mcp servers that connect claude and other llms to your tools, data, and services. built with fastmcp. deployed to smithery, docker, or your infra.",
    tags: ["model context protocol", "tool integration", "fastmcp", "claude desktop"],
    price: "from €800",
  },
  {
    id: "content",
    title: "content_pipeline_builder",
    description: "end-to-end content automation. from brief to finished copy, with brand voice learning, quality checks, and multi-channel output. built for agencies and content teams.",
    tags: ["brand voice ai", "copy generation", "editorial automation", "multi-channel"],
    price: "from €1200",
  },
  {
    id: "creative",
    title: "creative_ai_integration",
    description: "ai systems for creative workflows. generative audio, visual processing, interactive installations, live performance tools. where engineering meets art.",
    tags: ["generative audio", "real-time systems", "interactive", "supercollider"],
    price: "from €800",
  },
]

export default function ServicesPage() {
  const [hoveredService, setHoveredService] = useState<string | null>(null)
  const [scanlineOffset, setScanlineOffset] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setScanlineOffset((prev) => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-gray-300 font-[family-name:var(--font-geist-mono)] relative overflow-hidden">
      {/* scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(236, 72, 153, 0.1) 2px, rgba(236, 72, 153, 0.1) 4px)`,
          backgroundPosition: `0 ${scanlineOffset}px`,
        }}
      />

      {/* noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 opacity-[0.02] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noise%22%3E%3CfeTurbulence%20baseFrequency%3D%220.9%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noise)%22%2F%3E%3C%2Fsvg%3E')]" />

      <div className="relative z-10 max-w-4xl mx-auto px-8 py-16">
        {/* header */}
        <div className="mb-16">
          <Link
            href="/"
            className="text-gray-600 hover:text-pink-400 transition-colors text-sm mb-8 inline-block"
          >
            &lt;- messier@terminal:~/
          </Link>

          <div className="mt-8">
            <div className="text-pink-400 text-sm mb-2">$ cat services.txt</div>
            <h1 className="text-2xl text-pink-400 mb-4">
              <GlitchText text="services_and_rates" intensity={0.5} />
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
              i build ai systems that actually work. automation, tool integration, content pipelines, creative tech.
              production-grade, not prototype-grade. currently open for freelance &amp; contract work.
            </p>
          </div>
        </div>

        {/* services grid */}
        <div className="space-y-1 mb-16">
          <div className="text-pink-400 text-sm mb-4">$ ls -la available_services/</div>
          {services.map((service) => (
            <div
              key={service.id}
              className={`border transition-all duration-200 p-6 cursor-default ${
                hoveredService === service.id
                  ? "border-pink-400/50 bg-pink-400/5"
                  : "border-gray-800 bg-black"
              }`}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-pink-400 text-sm">
                  <GlitchText text={service.title} intensity={hoveredService === service.id ? 1.5 : 0.3} />
                </div>
                <div className="text-green-400 text-xs">{service.price}</div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">
                {service.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-gray-600 border border-gray-800 px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* process section */}
        <div className="mb-16">
          <div className="text-pink-400 text-sm mb-4">$ cat process.txt</div>
          <div className="border border-gray-800 p-6 space-y-4 text-sm">
            <div>
              <span className="text-green-400">01.</span>{" "}
              <span className="text-gray-300">you tell me what you need automated or built</span>
            </div>
            <div>
              <span className="text-green-400">02.</span>{" "}
              <span className="text-gray-300">i scope it, estimate time + cost, and send a proposal</span>
            </div>
            <div>
              <span className="text-green-400">03.</span>{" "}
              <span className="text-gray-300">i build it. you get async updates. typical turnaround: 1-3 weeks</span>
            </div>
            <div>
              <span className="text-green-400">04.</span>{" "}
              <span className="text-gray-300">you get the system, docs, and deployment. i support for 2 weeks post-delivery</span>
            </div>
          </div>
        </div>

        {/* background section */}
        <div className="mb-16">
          <div className="text-pink-400 text-sm mb-4">$ whoami --verbose</div>
          <div className="border border-gray-800 p-6 text-sm text-gray-400 leading-relaxed space-y-2">
            <p>ai engineer at a creative agency. i build mcp servers, content automation pipelines, pitch generators, editorial ai, and offer management systems - all in production, all used daily by real teams.</p>
            <p>also: music producer (messier), creative coder, writer. i think about systems at the intersection of engineering and art.</p>
            <p>stack: python, fastapi, fastmcp, claude api, typescript, next.js, supercollider, pytorch, docker, gcp.</p>
          </div>
        </div>

        {/* contact */}
        <div className="mb-16">
          <div className="text-pink-400 text-sm mb-4">$ cat contact.sh</div>
          <div className="border border-gray-800 p-6 text-sm space-y-2">
            <div><span className="text-green-400">email=</span>&quot;<a href="mailto:maramasaeva@gmail.com" className="text-gray-300 hover:text-pink-400 transition-colors underline decoration-pink-400/30 underline-offset-2">maramasaeva@gmail.com</a>&quot;</div>
            <div><span className="text-green-400">github=</span>&quot;<a href="https://github.com/maramasaeva" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-pink-400 transition-colors underline decoration-pink-400/30 underline-offset-2">github.com/maramasaeva</a>&quot;</div>
            <div><span className="text-green-400">discord=</span>&quot;<span className="text-gray-300">m.mssr</span>&quot;</div>
            <div className="text-yellow-400 mt-4">echo &quot;reach out. i respond fast.&quot;</div>
          </div>
        </div>

        {/* footer */}
        <div className="text-gray-700 text-xs border-t border-gray-900 pt-4">
          <Link href="/" className="hover:text-pink-400 transition-colors">
            messier-systems
          </Link>
          <span className="mx-2">|</span>
          <span>mara masaeva</span>
          <span className="mx-2">|</span>
          <span>leuven, be</span>
        </div>
      </div>
    </div>
  )
}
