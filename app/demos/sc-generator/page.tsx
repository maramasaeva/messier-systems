import type { Metadata } from "next"
import ScGeneratorDemo from "./sc-generator-demo"

export const metadata: Metadata = {
  title: "sc_generator Demo | Poem to SuperCollider Music",
  description:
    "Interactive demo: type a poem and watch it become SuperCollider code. Emotional analysis, audio matching, and live code generation by Mara Masaeva.",
  keywords: [
    "SuperCollider",
    "generative music",
    "poem to music",
    "creative coding",
    "live coding",
    "AI music",
    "interactive demo",
  ],
  openGraph: {
    title: "sc_generator - Poem to Music Demo",
    description:
      "Type a poem. Watch it become SuperCollider code. Interactive demo of AI-driven music generation.",
    url: "https://messier-systems.vercel.app/demos/sc-generator",
    siteName: "messier systems",
  },
  twitter: {
    card: "summary_large_image",
    title: "sc_generator - Poem to Music Demo",
    description: "Type a poem. Watch it become SuperCollider code.",
    site: "@rssmrm",
    creator: "@rssmrm",
  },
  alternates: {
    canonical: "https://messier-systems.vercel.app/demos/sc-generator",
  },
}

export default function ScGeneratorPage() {
  return <ScGeneratorDemo />
}
