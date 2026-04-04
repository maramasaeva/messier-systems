import { ActivityItem } from './types'

export async function fetchGitLabActivity(): Promise<ActivityItem[]> {
  const token = process.env.GITLAB_TOKEN
  if (!token) return []

  const res = await fetch(
    'https://gitlab.com/api/v4/events?per_page=100',
    {
      headers: {
        'PRIVATE-TOKEN': token,
      },
      next: { revalidate: 7200 },
    }
  )

  if (!res.ok) return []

  const events = await res.json()

  // Group events by day — never expose repo names or commit messages
  const dayMap = new Map<string, number>()
  for (const event of events) {
    const day = event.created_at?.slice(0, 10)
    if (day) dayMap.set(day, (dayMap.get(day) || 0) + 1)
  }

  const items: ActivityItem[] = []
  for (const [day, count] of dayMap) {
    const filled = Math.min(Math.round((count / 10) * 10), 10)
    const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(10 - filled)

    items.push({
      id: `gitlab-${day}`,
      source: 'gitlab',
      type: 'work',
      title: `${bar} ${count} contribution${count !== 1 ? 's' : ''}`,
      timestamp: `${day}T23:59:59Z`,
    })
  }

  return items
}
