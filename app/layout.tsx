import type { Metadata } from "next"
import { Geist, Geist_Mono, DM_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { getPersonJsonLd, getWebSiteJsonLd } from "@/lib/jsonld"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://messier-systems.vercel.app"),
  title: {
    default: "messier systems — Mara Masaeva",
    template: "%s | messier systems",
  },
  description:
    "Mara Masaeva — AI engineer, electronic music producer, and writer. Building production AI systems, generative sound, and agentic architectures. Leuven, Belgium.",
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const personJsonLd = getPersonJsonLd()
  const webSiteJsonLd = getWebSiteJsonLd()

  return (
    <html lang="en" className="p-0 m-0">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([personJsonLd, webSiteJsonLd]),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmMono.variable} antialiased p-0 m-0`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
