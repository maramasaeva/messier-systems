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
    `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=30`,
    { headers, next: { revalidate: 3600 } }
  )

  if (!res.ok) return []

  const events = await res.json()
  const items: ActivityItem[] = []

  for (const event of events) {
    // Skip obsidian repo — handled by obsidian fetcher
    if (event.repo?.name?.endsWith('/obsidian')) continue

    switch (event.type) {
      case 'PushEvent': {
        const commits = event.payload?.commits?.length || 0
        const repo = event.repo?.name?.split('/')[1] || 'unknown'
        items.push({
          id: event.id,
          source: 'github',
          type: 'push',
          title: `pushed ${commits} commit${commits !== 1 ? 's' : ''} to ${repo}`,
          timestamp: event.created_at,
          url: `https://github.com/${event.repo?.name}`,
        })
        break
      }
      case 'CreateEvent': {
        if (event.payload?.ref_type === 'repository') {
          const repo = event.repo?.name?.split('/')[1] || 'unknown'
          items.push({
            id: event.id,
            source: 'github',
            type: 'create',
            title: `created repository ${repo}`,
            timestamp: event.created_at,
            url: `https://github.com/${event.repo?.name}`,
          })
        }
        break
      }
      case 'PullRequestEvent': {
        const action = event.payload?.action
        const repo = event.repo?.name?.split('/')[1] || 'unknown'
        if (action === 'opened' || action === 'closed') {
          items.push({
            id: event.id,
            source: 'github',
            type: 'pr',
            title: `${action} PR in ${repo}`,
            timestamp: event.created_at,
            url: event.payload?.pull_request?.html_url,
          })
        }
        break
      }
      case 'ReleaseEvent': {
        const repo = event.repo?.name?.split('/')[1] || 'unknown'
        items.push({
          id: event.id,
          source: 'github',
          type: 'release',
          title: `released ${event.payload?.release?.tag_name || 'new version'} of ${repo}`,
          timestamp: event.created_at,
          url: event.payload?.release?.html_url,
        })
        break
      }
    }
  }

  return items
}
