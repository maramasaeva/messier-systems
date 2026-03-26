import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("https://messinecessity.substack.com/feed", {
      next: { revalidate: 3600 }, // cache for 1 hour
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch feed" },
        { status: 502 }
      )
    }

    const xml = await res.text()

    // Parse RSS items from XML
    const items: { title: string; link: string; pubDate: string }[] = []
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

      if (title) {
        items.push({ title, link, pubDate })
      }
    }

    return NextResponse.json({ posts: items.slice(0, 5) })
  } catch {
    return NextResponse.json(
      { error: "Failed to parse feed" },
      { status: 500 }
    )
  }
}
