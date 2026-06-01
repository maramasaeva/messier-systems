"use client"

import { useEffect, useState, type CSSProperties, type ReactNode } from "react"

/**
 * "Back" link for sub-pages. Points to the plain site if the visitor entered
 * via /plain this session, otherwise to the 3D terminal at "/". Defaults to
 * "/" until hydrated (sessionStorage is client-only).
 */
export default function BackLink({
  className,
  style,
  children,
}: {
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const [href, setHref] = useState("/")

  useEffect(() => {
    try {
      if (sessionStorage.getItem("messier-entry") === "plain") setHref("/plain")
    } catch {
      /* keep default "/" */
    }
  }, [])

  return (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  )
}
