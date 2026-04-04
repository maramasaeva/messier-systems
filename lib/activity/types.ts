export interface ActivityItem {
  id: string
  source: 'github' | 'gitlab' | 'substack' | 'obsidian' | 'bandcamp' | 'strava'
  type: string
  title: string
  timestamp: string
  url?: string
  metadata?: Record<string, string | number>
}

export interface ActivityResponse {
  items: ActivityItem[]
  sources: Record<string, 'ok' | 'error' | 'disabled'>
  lastSync: string
}

export const SOURCE_COLORS: Record<string, string> = {
  github: 'text-gray-300',
  gitlab: 'text-orange-400',
  substack: 'text-pink-400',
  obsidian: 'text-purple-400',
  bandcamp: 'text-cyan-400',
  strava: 'text-green-400',
}
