// Tunables for the doll's autonomous behavior. Animation clip names must match the
// rigged character.glb exactly: idle, walk, lie, sleep, lieDown, getUp, standUp,
// lookAround, walkStart, walkStop.

export type DollState = "IDLE" | "WANDER" | "LIE" | "LOOK_SKY"

// roughly: idle 40%, walk 30%, lie-sequence 30%, look around occasionally
export const WEIGHTS: Record<DollState, number> = {
  IDLE: 40,
  WANDER: 30,
  LIE: 30,
  LOOK_SKY: 5,
}

// seconds to dwell in a stationary state (WANDER ends on arrival; LOOK_SKY on clip end)
export const DWELL: Record<DollState, [number, number]> = {
  IDLE: [4, 9],
  LIE: [18, 24], // lie idle ~20s
  LOOK_SKY: [0, 0],
  WANDER: [0, 0],
}

// cruise speeds (world units/sec); mostly slow, occasionally fast
export const SPEED = { slow: 0.55, fast: 1.7 }
export const FAST_CHANCE = 0.18

// wander only in a ring AROUND the tablet: never under it (inner), never out to the
// buildings which start at radius 11 (outer). Consecutive targets step around the
// ring so the doll orbits the tablet instead of crossing under it.
export const INNER_RADIUS = 2.6
export const OUTER_RADIUS = 6.5
export const MAX_ANGLE_STEP = 1.2 // radians between successive wander targets
export const ARRIVE = 0.35 // arrival radius (units)
export const ACCEL = 1.8 // speed damp lambda (eased accel/decel)
export const TURN = 4.0 // yaw damp lambda
export const DECEL_DIST = 1.3 // start slowing within this distance of target

// grounding + walk sync — calibrated against the rigged GLB (tune in-browser)
export const FOOT_Y = -2.1 // group Y so feet rest on GROUND_Y (-3.2); origin is mesh-centre, feet ~1.1 below at scale 1.1
export const NOMINAL_WALK_SPEED = 1.02 // measured: 1.7u stride / 1.67s clip ≈ no foot-slide at timeScale 1
export const FADE = 0.3 // crossfade seconds

// one-shot transition → looping pose it resolves into
export const ONESHOT_FOLLOWUP: Record<string, string> = {
  lieDown: "lie",
}
