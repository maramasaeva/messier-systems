import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN

  const hasVars = {
    STRAVA_CLIENT_ID: !!clientId,
    STRAVA_CLIENT_SECRET: !!clientSecret && clientSecret.length > 0,
    STRAVA_REFRESH_TOKEN: !!refreshToken && refreshToken.length > 0,
    clientIdPrefix: clientId?.slice(0, 4) || 'missing',
  }

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json({ error: 'Missing env vars', hasVars })
  }

  const body = `client_id=${clientId}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: 'Token refresh failed', stravaResponse: data, hasVars })
  }

  return NextResponse.json({
    status: 'ok',
    hasAccessToken: !!data.access_token,
    athlete: data.athlete?.firstname,
    hasVars,
  })
}
