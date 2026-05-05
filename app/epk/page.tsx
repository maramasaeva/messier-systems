import type { Metadata } from "next"
import EpkContent from "./epk-content"

export const metadata: Metadata = {
  title: "messier - Electronic Press Kit | AI Engineer & Music Producer",
  description:
    "Electronic press kit for messier (Mara Masaeva). AI engineer, electronic music producer, and writer. IDM, ambient, jungle, noise, spoken word. Leuven, Belgium.",
  keywords: [
    "messier",
    "Mara Masaeva",
    "electronic press kit",
    "EPK",
    "electronic music",
    "IDM",
    "ambient",
    "music producer Belgium",
    "AI engineer music",
    "creative technologist",
  ],
  openGraph: {
    title: "messier - Electronic Press Kit",
    description:
      "AI engineer + electronic music producer + writer. IDM, ambient, jungle, noise, spoken word. Building sonic systems for feeling machines.",
    url: "https://messier-systems.vercel.app/epk",
    siteName: "messier systems",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "messier - Electronic Press Kit",
    description:
      "AI engineer + electronic music producer + writer. IDM, ambient, jungle, noise, spoken word.",
    site: "@rssmrm",
    creator: "@rssmrm",
  },
  alternates: {
    canonical: "https://messier-systems.vercel.app/epk",
  },
}

export default function EpkPage() {
  return <EpkContent />
}
