import type { NextConfig } from "next"

/**
 * messier systems serves its own content again.
 *
 * This site used to 307 everything to maramasaeva.com. The redirects are gone:
 * the routes here (including /plain and /3d) are worth sharing on their own.
 * maramasaeva.com remains the main site; some content exists in both places.
 */
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
