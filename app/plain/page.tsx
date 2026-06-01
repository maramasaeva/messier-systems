import type { Metadata } from "next"
import HackerHomepage from "@/homepage"
import EntryMarker from "@/components/EntryMarker"

export const metadata: Metadata = {
  title: "Mara Masaeva | messier — classic",
  description:
    "The classic, non-3D messier homepage. Mara Masaeva (messier) is an AI engineer & creative technologist based in Leuven, Belgium.",
  alternates: {
    canonical: "https://messier-systems.vercel.app/plain",
  },
}

export default function Plain() {
  return (
    <div className="w-screen h-screen overflow-hidden p-0 m-0">
      <EntryMarker kind="plain" />
      <HackerHomepage />
      {/* small entry back into the 3D terminal (the main experience) */}
      <a
        href="/"
        className="fixed top-4 right-4 z-50 font-mono text-[10px] uppercase tracking-[0.18em] text-pink-400/80 hover:text-pink-300 border border-pink-400/30 hover:border-pink-400/60 rounded-full px-3 py-1.5 bg-black/40 backdrop-blur-sm transition-colors no-underline"
      >
        enter the terminal ▷
      </a>
    </div>
  )
}
