import { ActivityItem } from './types'
import { discography } from '@/data/discography'

const BANDCAMP_URL = 'https://mmessier.bandcamp.com'

export async function fetchBandcampActivity(): Promise<ActivityItem[]> {
  const items: ActivityItem[] = []

  for (const release of discography) {
    const url = release.links.bandcamp || `${BANDCAMP_URL}`
    const date = new Date(release.releaseDate)
    // If the date is invalid (e.g. just "2025"), use Jan 1 of that year
    const timestamp = isNaN(date.getTime())
      ? new Date(`${release.releaseDate}-01-01`).toISOString()
      : date.toISOString()

    items.push({
      id: `bandcamp-${release.title}`,
      source: 'bandcamp',
      type: 'release',
      title: `released "${release.title}" ${release.type}`,
      timestamp,
      url,
    })
  }

  return items
}
