export interface SynthParams {
  waveform: "sine" | "sawtooth" | "square" | "triangle" | "noise"
  frequency: number
  detune: number
  filterFreq: number
  filterQ: number
  reverbMix: number
  reverbDecay: number
  delayTime: number
  delayFeedback: number
  attack: number
  sustain: number
  release: number
  amplitude: number
  pan: number
  lfoRate: number
  lfoDepth: number
}

export interface EmotionResult {
  emotion: string
  confidence: number
  color: string
  keywords: string[]
  synthParams: SynthParams
}

export interface GenerateRequest {
  poem: string
}

export interface GenerateResponse {
  emotions: EmotionResult[]
  scCode: string
  caption: string
}

export interface GestureState {
  bothHandsHigh: boolean
  bothHandsHighProgress: number
}

export interface MotionData {
  movementIntensity: number
  horizontalPosition: number
  verticalPosition: number
  spread: number
  gestures: GestureState
}

export interface EffectsState {
  reverb: { mix: number; size: number }
  delay: { time: number; feedback: number }
  echo: { level: number; spread: number }
  eq: { low: number; mid: number; high: number }
  filter: { type: "lowpass" | "highpass"; cutoff: number; resonance: number }
  distortion: { drive: number }
  loop: { active: boolean; length: number }
}
