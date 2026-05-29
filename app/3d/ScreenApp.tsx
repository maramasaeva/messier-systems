"use client"

import HackerHomepage from "@/homepage"

type LaunchableWindow =
  | "about"
  | "work"
  | "contact"
  | "music"
  | "tools"
  | "writing"
  | "epk"
  | "activity"

/**
 * Renders the real messier homepage onto the main tablet. The dock/nav
 * callbacks (when provided) divert clicks to the 3D tablet manager instead
 * of opening in-page windows / navigating.
 */
export default function ScreenApp({
  onOpenWindow,
  onNavigate,
}: {
  onOpenWindow?: (type: LaunchableWindow) => void
  onNavigate?: (href: string, label: string) => void
}) {
  return (
    <div className="crt-shell">
      <div className="screen-app">
        <HackerHomepage onOpenWindow={onOpenWindow} onNavigate={onNavigate} />
      </div>
      <div className="crt-shell__scan" />
      <div className="crt-shell__vignette" />
      <div className="crt-shell__flicker" />
    </div>
  )
}
