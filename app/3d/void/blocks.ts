// Shared monolith ("building") generator + ground constant. Imported by both
// DigitalVoid (to render the monoliths) and the doll's brain (to walk to them),
// so the seeded positions stay identical — no RNG duplication / desync.

export const GROUND_Y = -3.2

export function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Block = { pos: [number, number, number]; scale: [number, number, number] }

export function generateBlocks(count: number): Block[] {
  const rnd = mulberry32(2024)
  const blocks: Block[] = []
  for (let i = 0; i < count; i++) {
    // pushed out past the viewer, thinning into the mist
    const ang = rnd() * Math.PI * 2
    const rad = 11 + Math.pow(rnd(), 0.5) * 36
    const x = Math.cos(ang) * rad
    const z = Math.sin(ang) * rad
    const h = 2 + rnd() * 15
    const w = 0.8 + rnd() * 3.2
    const d = 0.8 + rnd() * 3.2
    blocks.push({ pos: [x, GROUND_Y + h / 2, z], scale: [w, h, d] })
  }
  return blocks
}
