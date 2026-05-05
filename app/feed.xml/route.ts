const BASE_URL = "https://messier-systems.vercel.app"

export async function GET() {
  let substackItems = ""

  try {
    const res = await fetch("https://messinecessity.substack.com/feed", {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const xml = await res.text()
      const itemRegex = /<item>([\s\S]*?)<\/item>/g
      let match
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1]
        const title =
          itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
          itemXml.match(/<title>(.*?)<\/title>/)?.[1] ||
          ""
        const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ""
        const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ""
        const description =
          itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ||
          itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] ||
          ""

        if (title) {
          substackItems += `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${escapeXml(link)}</link>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <guid>${escapeXml(link)}</guid>
    </item>`
        }
      }
    }
  } catch {
    // Substack unavailable - return feed without posts
  }

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>messier systems - Mara Masaeva</title>
    <link>${BASE_URL}</link>
    <description>AI engineer, electronic music producer, and writer. Building production AI systems, generative sound, and agentic architectures.</description>
    <language>en</language>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${substackItems}
  </channel>
</rss>`

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
