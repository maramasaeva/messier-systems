import { ActivityItem } from './types'

const GITHUB_USERNAME = 'maramasaeva'
const OBSIDIAN_REPO = 'obsidian'

export async function fetchObsidianActivity(): Promise<ActivityItem[]> {
  const token = process.env.GITHUB_TOKEN
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'messier-systems',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_USERNAME}/${OBSIDIAN_REPO}/commits?per_page=50`,
    { headers, next: { revalidate: 7200 } }
  )

  if (!res.ok) return []

  const commits = await res.json()

  // Group commits by day, count files changed per day
  const dayMap = new Map<string, { count: number; date: string }>()

  for (const commit of commits) {
    const date = commit.commit?.author?.date
    if (!date) continue
    const day = date.slice(0, 10)
    const existing = dayMap.get(day)
    if (existing) {
      existing.count++
    } else {
      dayMap.set(day, { count: 1, date })
    }
  }

  const items: ActivityItem[] = []
  for (const [day, { count }] of dayMap) {
    items.push({
      id: `obsidian-${day}`,
      source: 'obsidian',
      type: 'notes',
      title: `edited ${count} note${count !== 1 ? 's' : ''}`,
      timestamp: `${day}T12:00:00Z`,
    })
  }

  return items
}
