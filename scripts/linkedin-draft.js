#!/usr/bin/env node

/**
 * Weekly LinkedIn post draft generator.
 * Runs every Saturday. Fetches activity, builds a post in mara's voice:
 * lowercase, minimal, genuine. Leads with the biggest/coolest thing.
 * Work stuff framed around impact/skillset, not product names.
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

  // === RUNNING STATS ===
  let runningBlock = ''
  if (bySource.strava) {
    const runs = bySource.strava.filter(i => i.type === 'run')
    const training = bySource.strava.filter(i => i.type === 'training')
    let totalKm = 0
    let longestKm = 0
    for (const r of runs) {
      const match = r.title.match(/([\d.]+)km/)
      if (match) {
        const km = parseFloat(match[1])
        totalKm += km
        if (km > longestKm) longestKm = km
      }
    }

    const parts = []
    if (totalKm > 0) {
      parts.push(`${Math.round(totalKm)}km running this week`)
      if (longestKm >= 10) {
        parts.push(`including a ${Math.round(longestKm)}km`)
      }
    }
    if (runs.length > 0) parts.push(`${runs.length} run${runs.length !== 1 ? 's' : ''}`)
    if (training.length > 0) parts.push(`${training.length} gym session${training.length !== 1 ? 's' : ''}`)

    if (parts.length > 0) {
      // If there's a long run, lead with distance. Otherwise just summarize.
      if (totalKm >= 15 && longestKm >= 10) {
        runningBlock = `${Math.round(totalKm)}km running this week, including a ${Math.round(longestKm)}km. ${runs.length} run${runs.length !== 1 ? 's' : ''}${training.length > 0 ? `, ${training.length} gym session${training.length !== 1 ? 's' : ''}` : ''}.`
      } else if (totalKm > 0) {
        runningBlock = `${Math.round(totalKm)}km across ${runs.length} run${runs.length !== 1 ? 's' : ''}${training.length > 0 ? ` and ${training.length} gym session${training.length !== 1 ? 's' : ''}` : ''} this week.`
      } else if (training.length > 0) {
        runningBlock = `${training.length} gym session${training.length !== 1 ? 's' : ''} this week.`
      }
    }
  }

  // === WORK (GITLAB) ===
  let workBlock = ''
  if (bySource.gitlab) {
    const total = bySource.gitlab.reduce((sum, i) => {
      const match = i.title.match(/(\d+) contribution/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0)
    if (total > 0) {
      // Generic framing — the user adds specifics about what they built
      workBlock = `[WORK: ${total} contributions this week — describe what you built in terms of impact, not product names. e.g. "built AI tools that help people X, automate Y, and Z. the kind of systems where you remove hours of manual work and replace it with something that actually adapts to context."]`
    }
  }

  // === PERSONAL CODE (GITHUB) ===
  let codeBlock = ''
  if (bySource.github) {
    const repos = [...new Set(bySource.github.map(i => {
      const match = i.title.match(/(?:worked on|created|released) (.+)/)
      return match ? match[1] : null
    }).filter(Boolean))]

    if (repos.length > 0) {
      // Check if any were "created" (new repos)
      const created = bySource.github.filter(i => i.title.startsWith('created ')).map(i => i.title.replace('created ', ''))
      const worked = repos.filter(r => !created.includes(r))

      const parts = []
      if (worked.length > 0) parts.push(`worked on ${worked.join(', ')}`)
      if (created.length > 0) parts.push(`started ${created.join(', ')}`)
      codeBlock = parts.join('. ') + '.'
    }
  }

  // === WRITING ===
  let writingBlock = ''
  if (bySource.substack) {
    const posts = bySource.substack.map(i => {
      const match = i.title.match(/published "(.+)"/)
      return match ? match[1] : null
    }).filter(Boolean)
    if (posts.length > 0) {
      writingBlock = `published ${posts.map(p => `"${p}"`).join(' and ')} on substack.`
    }
  }
  if (bySource.obsidian) {
    const total = bySource.obsidian.reduce((sum, i) => {
      const match = i.title.match(/edited (\d+)/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0)
    if (total > 0) {
      writingBlock += writingBlock ? ` also wrote ${total} notes.` : `wrote ${total} notes this week.`
    }
  }

  // === MUSIC ===
  let musicBlock = ''
  if (bySource.bandcamp) {
    // Only include if there's a release from this week (not historical)
    const recentReleases = bySource.bandcamp.filter(i => {
      const releaseDate = new Date(i.timestamp)
      return releaseDate >= weekAgo
    })
    if (recentReleases.length > 0) {
      const titles = recentReleases.map(i => {
        const match = i.title.match(/released "(.+)"/)
        return match ? match[1] : null
      }).filter(Boolean)
      if (titles.length > 0) {
        musicBlock = `released ${titles.map(t => `"${t}"`).join(' and ')} on bandcamp.`
      }
    }
  }

  // === ASSEMBLE POST ===
  // Order: biggest achievement first (running if big distance, then work, then personal code, writing, music)
  const blocks = []

  // Running leads if there was a notable distance
  if (runningBlock) blocks.push(runningBlock)

  // Work — always include if present
  if (workBlock) blocks.push(workBlock)

  // Personal projects
  const personalParts = []
  if (codeBlock) personalParts.push(codeBlock)
  if (writingBlock) personalParts.push(writingBlock)
  if (musicBlock) personalParts.push(musicBlock)
  if (personalParts.length > 0) blocks.push(personalParts.join(' '))

  // Sign off
  blocks.push('messier-systems.vercel.app')

  const post = blocks.join('\n\n')

  const draft = {
    generatedAt: now.toISOString(),
    weekOf: weekAgo.toISOString().slice(0, 10),
    post,
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
