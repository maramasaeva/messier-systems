import { ActivityItem } from './types'

export async function fetchSubstackActivity(): Promise<ActivityItem[]> {
  const res = await fetch('https://messinecessity.substack.com/feed', {
    headers: { 'User-Agent': 'messier-systems/1.0' },
    next: { revalidate: 3600 },
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
        id: `substack-${link}`,
        source: 'substack',
        type: 'post',
        title: `published "${title.toLowerCase()}"`,
        timestamp: new Date(pubDate).toISOString(),
        url: link,
      })
    }
  }

  return items
}
