"use client"

import { useEffect } from "react"

/**
 * Records how the visitor entered the site (the 3D terminal at "/" or the
 * plain site at "/plain") in sessionStorage, so sub-pages can send the
 * "back" link to wherever they actually came from.
 */
export default function EntryMarker({ kind }: { kind: "plain" | "terminal" }) {
  useEffect(() => {
    try {
      sessionStorage.setItem("messier-entry", kind)
    } catch {
      /* sessionStorage unavailable — fall back to default back-link */
    }
  }, [kind])

  return null
}
