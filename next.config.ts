import type { NextConfig } from "next"

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
      {
        source: "/contact",
        destination: "/",
        permanent: true,
      },
      {
        source: "/work",
        destination: "/",
        permanent: true,
      },
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
