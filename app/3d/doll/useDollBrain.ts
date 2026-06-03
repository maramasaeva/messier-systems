import { useMemo } from "react"
import * as THREE from "three"
import {
  DollState,
  WEIGHTS,
  DWELL,
  SPEED,
  FAST_CHANCE,
  INNER_RADIUS,
  OUTER_RADIUS,
  MAX_ANGLE_STEP,
} from "./behaviorConfig"

// Each state is a short sequence of animation phases. A phase ends after:
//   "arrive" — the doll reaches its locomotion target
//   "dwell"  — a randomized dwell time elapses
//   "clip"   — the (non-looping) clip finishes playing
type Hold = "arrive" | "dwell" | "clip"
type Phase = { clip: string; loop: boolean; hold: Hold }

const SEQ: Record<DollState, Phase[]> = {
  IDLE: [{ clip: "idle", loop: true, hold: "dwell" }],
  WANDER: [{ clip: "walk", loop: true, hold: "arrive" }],
  LIE: [
    { clip: "lieDown", loop: false, hold: "clip" },
    { clip: "lie", loop: true, hold: "dwell" },
    { clip: "getUp", loop: false, hold: "clip" },
  ],
  LOOK_SKY: [{ clip: "lookAround", loop: false, hold: "clip" }],
}

export interface BrainView {
  state: DollState
  clip: string
  loop: boolean
  target: THREE.Vector2 | null
  pace: "slow" | "fast"
}

export function useDollBrain(spawnAngle = 0) {
  return useMemo(() => {
    const rng = Math.random
    const clipDur: Record<string, number> = {} // injected by the controller
    let known: Set<string> = new Set()

    let state: DollState = "IDLE"
    let phase = 0
    let phaseStart = 0
    let dwell = 4
    let pace: "slow" | "fast" = "slow"
    let target: THREE.Vector2 | null = null
    let arrived = false
    let started = false
    let lastAngle = spawnAngle // angle around the tablet, stepped each wander

    // optional debug pin: ?doll=LIE
    let pinned: DollState | null = null
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("doll")
      if (q && q.toUpperCase() in WEIGHTS) pinned = q.toUpperCase() as DollState
    }

    const randRange = ([a, b]: [number, number]) => a + rng() * (b - a)

    function phases() {
      // skip phases whose clip isn't in the GLB (graceful degrade)
      return SEQ[state].filter((p) => known.size === 0 || known.has(p.clip))
    }

    function pickNext(): DollState {
      if (pinned) return pinned
      const entries = (Object.entries(WEIGHTS) as [DollState, number][]).filter(([s]) => s !== state)
      const total = entries.reduce((a, [, w]) => a + w, 0)
      let r = rng() * total
      for (const [s, w] of entries) if ((r -= w) <= 0) return s
      return "WANDER"
    }

    function enter(next: DollState, t: number) {
      state = next
      phase = 0
      phaseStart = t
      arrived = false
      target = null
      dwell = randRange(DWELL[next])
      if (next === "WANDER") {
        // step around the ring (never across the centre, where the tablet is)
        lastAngle += (rng() < 0.5 ? -1 : 1) * (0.3 + rng() * MAX_ANGLE_STEP)
        const rad = INNER_RADIUS + rng() * (OUTER_RADIUS - INNER_RADIUS)
        target = new THREE.Vector2(Math.cos(lastAngle) * rad, Math.sin(lastAngle) * rad)
        pace = rng() < FAST_CHANCE ? "fast" : "slow"
      }
    }

    function curPhase(): Phase | null {
      const ps = phases()
      return ps[phase] ?? null
    }

    function advance(t: number) {
      const ps = phases()
      if (phase < ps.length - 1) {
        phase++
        phaseStart = t
        arrived = false
      } else {
        enter(pickNext(), t)
      }
    }

    return {
      get state() {
        return state
      },
      setDurations(d: Record<string, number>) {
        Object.assign(clipDur, d)
        known = new Set(Object.keys(d))
      },
      onArrive(t: number) {
        const p = curPhase()
        if (p && p.hold === "arrive") {
          arrived = true
          advance(t)
        }
      },
      tick(t: number, _dt: number) {
        if (!started) {
          started = true
          enter(pinned ?? "IDLE", t)
        }
        const p = curPhase()
        if (!p) {
          enter(pickNext(), t)
          return
        }
        const age = t - phaseStart
        if (p.hold === "dwell" && age >= dwell) advance(t)
        else if (p.hold === "clip" && age >= (clipDur[p.clip] ?? 1.2)) advance(t)
        // "arrive" phases wait for onArrive()
      },
      view(): BrainView {
        const p = curPhase()
        return {
          state,
          clip: p?.clip ?? "idle",
          loop: p?.loop ?? true,
          target,
          pace,
        }
      },
    }
  }, [])
}

export { SPEED }
