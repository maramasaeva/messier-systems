import { ActivityItem } from './types'

export async function fetchBandcampActivity(): Promise<ActivityItem[]> {
  try {
    const res = await fetch('https://mmessier.bandcamp.com/feed', {
      headers: { 'User-Agent': 'messier-systems/1.0' },
      next: { revalidate: 21600 }, // 6 hours — releases are rare
    })

    if (!res.ok) return []

    const xml = await res.text()
    const items: ActivityItem[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1]
      const title =
        itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
        itemXml.match(/<title>(.*?)<\/title>/)?.[1] ||
        ''
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''

      if (title) {
        items.push({
          id: `bandcamp-${link}`,
          source: 'bandcamp',
          type: 'release',
          title: `released "${title.toLowerCase()}"`,
          timestamp: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          url: link,
        })
      }
    }

    return items
  } catch {
    return []
  }
}
