import type { Metadata } from "next"
import ThinkContent from "./think-content"

export const metadata: Metadata = {
  title: "AI Ethics & Literacy | Mara Masaeva",
  description:
    "An AI engineer's perspective on responsible AI adoption, cognitive offloading, children's development, and digital literacy. Workshops and talks available in Belgium.",
  keywords: [
    "AI ethics",
    "AI literacy",
    "responsible AI",
    "cognitive offloading",
    "children AI",
    "digital wellbeing",
    "AI workshops Belgium",
    "AI speaker",
    "Mara Masaeva",
  ],
  openGraph: {
    title: "AI Ethics & Literacy | Mara Masaeva",
    description:
      "An AI engineer's perspective on responsible AI adoption. Workshops and talks on AI literacy, cognitive offloading, and digital wellbeing.",
    url: "https://messier-systems.vercel.app/think",
    siteName: "messier systems",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Ethics & Literacy | Mara Masaeva",
    description:
      "An AI engineer's perspective on responsible AI adoption. Workshops and talks available.",
    site: "@rssmrm",
    creator: "@rssmrm",
  },
  alternates: {
    canonical: "https://messier-systems.vercel.app/think",
  },
}

export default function ThinkPage() {
  return <ThinkContent />
}
