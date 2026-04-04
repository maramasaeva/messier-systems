import { ActivityItem } from './types'

const GITHUB_USERNAME = 'maramasaeva'

export async function fetchGitHubActivity(): Promise<ActivityItem[]> {
  const token = process.env.GITHUB_TOKEN
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'messier-systems',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`,
    { headers, next: { revalidate: 3600 } }
  )

  if (!res.ok) return []

  const events = await res.json()

  // Group events by (repo, day) to avoid noisy per-push entries
  const dayRepoMap = new Map<string, { repo: string; types: Set<string>; timestamp: string }>()

  for (const event of events) {
    const repo = event.repo?.name?.split('/')[1] || 'unknown'
    // Skip obsidian repo — handled by obsidian fetcher
    if (repo === 'obsidian') continue

    const day = event.created_at?.slice(0, 10)
    if (!day) continue
    const key = `${repo}-${day}`

    if (!dayRepoMap.has(key)) {
      dayRepoMap.set(key, { repo, types: new Set(), timestamp: event.created_at })
    }
    dayRepoMap.get(key)!.types.add(event.type)
  }

  const items: ActivityItem[] = []

  for (const [key, { repo, types, timestamp }] of dayRepoMap) {
    let action = 'worked on'
    if (types.has('CreateEvent') && types.size === 1) {
      action = 'created'
    } else if (types.has('ReleaseEvent')) {
      action = 'released'
    }

    items.push({
      id: `github-${key}`,
      source: 'github',
      type: 'work',
      title: `${action} ${repo}`,
      timestamp,
      url: `https://github.com/${GITHUB_USERNAME}/${repo}`,
    })
  }

  return items
}
