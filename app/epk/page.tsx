import type { Metadata } from "next"
import EpkContent from "./epk-content"

export const metadata: Metadata = {
  title: "messier — electronic press kit",
  description:
    "electronic press kit for messier (mara masaeva). ai engineer, music producer, writer. building sonic systems for feeling machines.",
  openGraph: {
    title: "messier — electronic press kit",
    description:
      "ai engineer + music producer + writer. building sonic systems for feeling machines.",
    url: "https://messier-systems.vercel.app/epk",
    siteName: "messier systems",
    type: "profile",
  },
  twitter: {
    card: "summary",
    title: "messier — electronic press kit",
    description:
      "ai engineer + music producer + writer. building sonic systems for feeling machines.",
    site: "@rssmrm",
  },
}

export default function EpkPage() {
  return <EpkContent />
}
