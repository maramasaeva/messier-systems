import { ActivityItem } from './types'

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) return null

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    body: params,
    cache: 'no-store',
  })

  if (!res.ok) return null
  const data = await res.json()
  return data.access_token || null
}

export async function fetchStravaActivity(): Promise<ActivityItem[]> {
  const token = await getAccessToken()
  if (!token) return []

  const res = await fetch(
    'https://www.strava.com/api/v3/athlete/activities?per_page=30',
    {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    }
  )

  if (!res.ok) return []

  const activities = await res.json()
  const items: ActivityItem[] = []

  for (const activity of activities) {
    const type = activity.type

    if (type === 'Run' || type === 'Walk' || type === 'Hike') {
      const km = (activity.distance / 1000).toFixed(1)
      const mins = Math.floor(activity.moving_time / 60)
      const secs = activity.moving_time % 60
      const time = `${mins}:${secs.toString().padStart(2, '0')}`
      const verb = type === 'Run' ? 'ran' : type === 'Walk' ? 'walked' : 'hiked'

      items.push({
        id: `strava-${activity.id}`,
        source: 'strava',
        type: type.toLowerCase(),
        title: `${verb} ${km}km in ${time}`,
        timestamp: activity.start_date,
        url: `https://www.strava.com/activities/${activity.id}`,
        metadata: {
          distance: activity.distance,
          movingTime: activity.moving_time,
          elevationGain: activity.total_elevation_gain || 0,
        },
      })
    } else if (type === 'WeightTraining' || type === 'Workout') {
      const mins = Math.floor(activity.moving_time / 60)
      items.push({
        id: `strava-${activity.id}`,
        source: 'strava',
        type: 'training',
        title: `trained for ${mins}min`,
        timestamp: activity.start_date,
        url: `https://www.strava.com/activities/${activity.id}`,
      })
    }
  }

  return items
}
