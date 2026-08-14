import type { NextConfig } from "next"

/**
 * messier systems has moved to maramasaeva.com.
 *
 * Everything redirects. Routes whose content has an equivalent on the new site
 * go to that equivalent so inbound links keep landing somewhere useful; the
 * rest fall through to the homepage.
 *
 * These are 307s (permanent: false) on purpose. A 308 is cached hard by
 * browsers and is painful to walk back, and this move is new. Flip
 * `permanent` to true once it's settled and you want search engines to
 * consolidate ranking onto the new domain.
 */
const NEW_SITE = "https://maramasaeva.com"

const moved = (source: string, path = ""): {
  source: string
  destination: string
  permanent: boolean
} => ({
  source,
  destination: `${NEW_SITE}${path}`,
  permanent: false,
})

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "messier-systems.vercel.app",
      },
    ],
  },

  async redirects() {
    return [
      // content that has a home on the new site
      moved("/security", "/work/plzdontkillus"),
      moved("/think", "/writing/think"),
      moved("/projects", "/work"),
      moved("/work", "/work"),
      moved("/demos", "/work"),
      moved("/demos/:path*", "/work"),
      moved("/resume", "/about"),
      moved("/epk", "/about"),
      moved("/uses", "/about"),
      moved("/blog", "/writing"),
      moved("/transmissions", "/writing"),

      // everything else, including /, /plain, /3d, /services and the api routes
      moved("/:path*"),
    ]
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // SAMEORIGIN (not DENY) so the /3d experiment can embed our own
            // routes in iframes. Still blocks third-party framing.
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ]
  },
}

export default nextConfig
