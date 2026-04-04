import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 })
  }

  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Strava not configured' }, { status: 500 })
  }

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: 'Token exchange failed', detail: data }, { status: 502 })
  }

  // Display the refresh token for the user to save as env var
  return new NextResponse(
    `<html><body style="background:#000;color:#0f0;font-family:monospace;padding:2rem">
      <h2>strava connected</h2>
      <p>add this refresh token as STRAVA_REFRESH_TOKEN in vercel env:</p>
      <pre style="background:#111;padding:1rem;border:1px solid #0f0">${data.refresh_token}</pre>
      <p>athlete: ${data.athlete?.firstname} ${data.athlete?.lastname}</p>
      <p>you can close this tab now.</p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
