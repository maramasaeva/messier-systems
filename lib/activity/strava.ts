import { ActivityItem } from './types'

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) return null

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) return null
  const data = await res.json()
  return data.access_token || null
}

export async function fetchStravaActivity(): Promise<ActivityItem[]> {
  const token = await getAccessToken()
  if (!token) return []

  const res = await fetch(
    'https://www.strava.com/api/v3/athlete/activities?per_page=15',
    {
      headers: { 'Authorization': `Bearer ${token}` },
      next: { revalidate: 7200 },
    }
  )

  if (!res.ok) return []

  const activities = await res.json()
  const items: ActivityItem[] = []

  for (const activity of activities) {
    if (activity.type !== 'Run' && activity.type !== 'Walk' && activity.type !== 'Hike') continue

    const km = (activity.distance / 1000).toFixed(1)
    const mins = Math.floor(activity.moving_time / 60)
    const secs = activity.moving_time % 60
    const time = `${mins}:${secs.toString().padStart(2, '0')}`
    const type = activity.type.toLowerCase()

    items.push({
      id: `strava-${activity.id}`,
      source: 'strava',
      type,
      title: `${type === 'run' ? 'ran' : type === 'walk' ? 'walked' : 'hiked'} ${km}km in ${time}`,
      timestamp: activity.start_date,
      url: `https://www.strava.com/activities/${activity.id}`,
      metadata: {
        distance: activity.distance,
        movingTime: activity.moving_time,
        elevationGain: activity.total_elevation_gain || 0,
      },
    })
  }

  return items
}
