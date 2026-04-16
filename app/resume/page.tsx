import type { Metadata } from "next"
import ResumeContent from "./resume-content"

export const metadata: Metadata = {
  title: "Mara Masaeva - Resume | AI Engineer, Leuven Belgium",
  description:
    "AI engineer with 3+ years building production AI systems. MCP servers, agentic architectures, generative AI, NLP. KU Leuven Advanced Master AI. Based in Leuven, Belgium.",
  keywords: [
    "Mara Masaeva",
    "AI engineer resume",
    "MCP servers",
    "Python",
    "TypeScript",
    "machine learning",
    "KU Leuven",
    "Belgium",
    "agentic architecture",
    "NLP engineer",
  ],
  openGraph: {
    title: "Mara Masaeva - Resume | AI Engineer",
    description:
      "AI engineer with 3+ years building production AI systems, MCP servers, and agentic architectures. KU Leuven. Leuven, Belgium.",
    url: "https://messier-systems.vercel.app/resume",
    siteName: "messier systems",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mara Masaeva - Resume | AI Engineer",
    description:
      "AI engineer with 3+ years building production AI systems, MCP servers, and agentic architectures.",
    site: "@rssmrm",
    creator: "@rssmrm",
  },
  alternates: {
    canonical: "https://messier-systems.vercel.app/resume",
  },
}

export default function ResumePage() {
  return <ResumeContent />
}
