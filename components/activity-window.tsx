"use client"

import { useState, useEffect } from 'react'

interface ActivityItem {
  id: string
  source: string
  type: string
  title: string
  timestamp: string
  url?: string
}

interface ActivityResponse {
  items: ActivityItem[]
  sources: Record<string, 'ok' | 'error' | 'disabled'>
  lastSync: string
}

const SOURCE_COLORS: Record<string, string> = {
  github: 'text-gray-300',
  gitlab: 'text-orange-400',
  substack: 'text-pink-400',
  obsidian: 'text-purple-400',
  bandcamp: 'text-cyan-400',
  strava: 'text-green-400',
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day} ${hours}:${mins}`
}

function timeSince(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function ActivityWindowContent() {
  const [data, setData] = useState<ActivityResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/activity')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="font-mono text-sm">
      <div className="text-pink-400 mb-1">$ cat /proc/activity_monitor</div>
      <div className="text-gray-500 mb-3">[system] aggregating feeds...</div>

      <div className="text-pink-400 mb-2">$ tail -f activity.log</div>

      {loading ? (
        <div className="text-gray-500 animate-pulse">fetching from sources...</div>
      ) : data && data.items.length > 0 ? (
        <div className="space-y-1">
          {data.items.slice(0, 30).map((item) => (
            <div key={item.id} className="flex">
              <span className="text-gray-600 shrink-0">[{formatTimestamp(item.timestamp)}]</span>
              <span className={`mx-2 shrink-0 w-20 text-right ${SOURCE_COLORS[item.source] || 'text-gray-400'}`}>
                {item.source}
              </span>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pink-400 transition-colors truncate"
                >
                  {item.title}
                </a>
              ) : (
                <span className="text-gray-300 truncate">{item.title}</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">no activity data available</div>
      )}

      {/* uptime footer */}
      {data && (
        <div className="mt-4 border-t border-gray-700 pt-3">
          <div className="text-pink-400 mb-1">$ uptime</div>
          <div className="text-gray-400">
            sources:{' '}
            {Object.entries(data.sources).map(([name, status]) => (
              <span key={name} className={SOURCE_COLORS[name] || 'text-gray-400'}>
                {name}
                {status === 'ok' ? '\u2713' : status === 'error' ? '\u2717' : '\u2013'}{' '}
              </span>
            ))}
          </div>
          <div className="text-gray-500 text-xs">
            last sync: {timeSince(data.lastSync)}
          </div>
        </div>
      )}

      <div className="text-pink-400 mt-3 flex items-center">
        <span>$</span>
        <span className="ml-2 animate-pulse">_</span>
      </div>
    </div>
  )
}
