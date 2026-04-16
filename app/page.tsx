import type { Metadata } from "next"
import HackerHomepage from "../homepage"

export const metadata: Metadata = {
  title: "Mara Masaeva | AI Engineer & Creative Technologist",
  description:
    "Mara Masaeva (messier) is an AI engineer & creative technologist based in Leuven, Belgium. Building production AI systems, MCP servers, generative sound, and agentic architectures.",
  keywords: [
    "Mara Masaeva",
    "messier",
    "AI engineer",
    "creative technologist",
    "MCP servers",
    "generative AI",
    "music producer",
    "Leuven",
    "Belgium",
    "machine learning",
    "agentic architecture",
  ],
  authors: [{ name: "Mara Masaeva", url: "https://messier-systems.vercel.app" }],
  creator: "Mara Masaeva",
  openGraph: {
    type: "website",
    title: "Mara Masaeva | AI Engineer & Creative Technologist",
    description:
      "AI engineer & creative technologist building production AI systems, generative sound, and agentic architectures. Based in Leuven, Belgium.",
    url: "https://messier-systems.vercel.app",
    siteName: "messier systems",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mara Masaeva | AI Engineer & Creative Technologist",
    description:
      "AI engineer & creative technologist building production AI systems, generative sound, and agentic architectures.",
    site: "@rssmrm",
    creator: "@rssmrm",
  },
  alternates: {
    canonical: "https://messier-systems.vercel.app",
  },
}

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden p-0 m-0">
      <HackerHomepage />
    </div>
  )
}