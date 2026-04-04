import { ActivityItem, ActivityResponse } from './types'
import { fetchGitHubActivity } from './github'
import { fetchGitLabActivity } from './gitlab'
import { fetchSubstackActivity } from './substack'
import { fetchObsidianActivity } from './obsidian'
import { fetchBandcampActivity } from './bandcamp'
import { fetchStravaActivity } from './strava'

type SourceName = ActivityItem['source']

const fetchers: { name: SourceName; fn: () => Promise<ActivityItem[]> }[] = [
  { name: 'github', fn: fetchGitHubActivity },
  { name: 'gitlab', fn: fetchGitLabActivity },
  { name: 'substack', fn: fetchSubstackActivity },
  { name: 'obsidian', fn: fetchObsidianActivity },
  { name: 'bandcamp', fn: fetchBandcampActivity },
  { name: 'strava', fn: fetchStravaActivity },
]

export async function aggregateActivity(): Promise<ActivityResponse> {
  const results = await Promise.allSettled(fetchers.map(f => f.fn()))

  const items: ActivityItem[] = []
  const sources: Record<string, 'ok' | 'error' | 'disabled'> = {}

  results.forEach((result, i) => {
    const name = fetchers[i].name
    if (result.status === 'fulfilled') {
      if (result.value.length > 0) {
        items.push(...result.value)
        sources[name] = 'ok'
      } else {
        sources[name] = 'disabled'
      }
    } else {
      sources[name] = 'error'
    }
  })

  // Sort by timestamp, newest first
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return {
    items,
    sources,
    lastSync: new Date().toISOString(),
  }
}
