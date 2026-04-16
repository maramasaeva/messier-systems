import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/callback", "/spotify-callback"],
    },
    sitemap: "https://messier-systems.vercel.app/sitemap.xml",
  }
}
