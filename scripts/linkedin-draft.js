#!/usr/bin/env node

/**
 * Weekly LinkedIn post draft generator.
 * Fetches activity from the deployed site, filters to last 7 days,
 * generates a lowercase/minimal summary draft.
 */

const SITE_URL = process.env.SITE_URL || 'https://messier-systems.vercel.app'

async function main() {
  const res = await fetch(`${SITE_URL}/api/activity`)
  if (!res.ok) {
    console.error('failed to fetch activity:', res.status)
    process.exit(1)
  }

  const data = await res.json()
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const thisWeek = data.items.filter(
    (item) => new Date(item.timestamp) >= weekAgo
  )

  if (thisWeek.length === 0) {
    console.log('no activity this week, skipping draft.')
    process.exit(0)
  }

  // Group by source
  const bySource = {}
  for (const item of thisWeek) {
    if (!bySource[item.source]) bySource[item.source] = []
    bySource[item.source].push(item)
  }

  // Build draft
  const lines = []

  // Opening — varies based on what was done
  const sources = Object.keys(bySource)
  if (sources.length >= 3) {
    lines.push('this week was a mix of things.\n')
  } else if (sources.includes('github')) {
    lines.push('shipped some things this week.\n')
  } else {
    lines.push('a few things from this week.\n')
  }

  // Per-source summaries
  if (bySource.github) {
    const pushes = bySource.github.filter(i => i.type === 'push')
    const repos = [...new Set(pushes.map(i => i.title.split(' to ')[1]).filter(Boolean))]
    if (repos.length > 0) {
      lines.push(`code: worked on ${repos.join(', ')}`)
    }
  }

  if (bySource.gitlab) {
    const total = bySource.gitlab.reduce((sum, i) => {
      const match = i.title.match(/(\d+) contribution/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0)
    if (total > 0) lines.push(`work: ${total} contributions this week`)
  }

  if (bySource.substack) {
    for (const post of bySource.substack) {
      lines.push(`writing: ${post.title}`)
    }
  }

  if (bySource.obsidian) {
    const total = bySource.obsidian.reduce((sum, i) => {
      const match = i.title.match(/edited (\d+)/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0)
    if (total > 0) lines.push(`notes: ${total} notes edited`)
  }

  if (bySource.bandcamp) {
    for (const release of bySource.bandcamp) {
      lines.push(`music: ${release.title}`)
    }
  }

  if (bySource.strava) {
    const runs = bySource.strava
    const totalKm = runs.reduce((sum, r) => {
      const match = r.title.match(/([\d.]+)km/)
      return sum + (match ? parseFloat(match[1]) : 0)
    }, 0)
    if (totalKm > 0) {
      lines.push(`running: ${totalKm.toFixed(1)}km across ${runs.length} run${runs.length !== 1 ? 's' : ''}`)
    }
  }

  // Closing
  lines.push('')
  lines.push('building in public. more at messier-systems.vercel.app')

  const draft = {
    generatedAt: now.toISOString(),
    weekOf: weekAgo.toISOString().slice(0, 10),
    post: lines.join('\n'),
    itemCount: thisWeek.length,
    sources: Object.keys(bySource),
  }

  // Write to data/linkedin-draft.json
  const fs = await import('fs')
  const path = await import('path')
  const outPath = path.join(process.cwd(), 'data', 'linkedin-draft.json')
  fs.writeFileSync(outPath, JSON.stringify(draft, null, 2) + '\n')

  console.log('draft generated:')
  console.log('---')
  console.log(draft.post)
  console.log('---')
  console.log(`saved to ${outPath}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
