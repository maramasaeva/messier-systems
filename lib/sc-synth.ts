import type { EmotionResult, MotionData, EffectsState } from "@/types/sc-generator"

interface VoiceNodes {
  source: OscillatorNode | AudioBufferSourceNode
  filter: BiquadFilterNode
  gain: GainNode
  panner: StereoPannerNode
  lfo: OscillatorNode
  lfoGain: GainNode
  baseFilterFreq: number
  baseAmplitude: number
  basePan: number
}

interface SynthInstance {
  stop: () => void
  analyser: AnalyserNode
  updateMotion: (data: MotionData) => void
  getEffectsState: () => EffectsState
}

function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const buffer = ctx.createBuffer(2, length, sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
  }
  return buffer
}

function createImpulseResponse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const buffer = ctx.createBuffer(2, length, sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * decay))
    }
  }
  return buffer
}

function createSoftClipCurve(samples: number): Float32Array {
  const curve = new Float32Array(samples)
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1
    curve[i] = Math.tanh(x * 1.5)
  }
  return curve
}

function createDistortionCurve(drive: number, samples: number): Float32Array {
  const curve = new Float32Array(samples)
  const k = drive * 100
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1
    curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x))
  }
  return curve
}

function dbToGain(db: number): number {
  return Math.pow(10, db / 20)
}

export function playSynthesis(
  emotions: EmotionResult[],
  onWaveformData?: (data: number[]) => void,
  onEffectsState?: (state: EffectsState) => void
): SynthInstance {
  const ctx = new AudioContext()
  const now = ctx.currentTime

  // Master chain
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.5

  const clipper = ctx.createWaveShaper()
  clipper.curve = createSoftClipCurve(4096)
  clipper.oversample = "2x"

  const analyser = ctx.createAnalyser()
  analyser.fftSize = 128
  analyser.smoothingTimeConstant = 0.8

  masterGain.connect(clipper)
  clipper.connect(analyser)
  analyser.connect(ctx.destination)

  // Voices bus — everything enters the FX rack here
  const voicesBus = ctx.createGain()
  voicesBus.gain.value = 1

  // --- FX Rack ---

  // 3-band EQ (low shelf, mid peaking, high shelf)
  const eqLow = ctx.createBiquadFilter()
  eqLow.type = "lowshelf"
  eqLow.frequency.value = 200
  eqLow.gain.value = 0

  const eqMid = ctx.createBiquadFilter()
  eqMid.type = "peaking"
  eqMid.frequency.value = 1200
  eqMid.Q.value = 0.8
  eqMid.gain.value = 0

  const eqHigh = ctx.createBiquadFilter()
  eqHigh.type = "highshelf"
  eqHigh.frequency.value = 4000
  eqHigh.gain.value = 0

  // Distortion
  const distortion = ctx.createWaveShaper()
  distortion.curve = createDistortionCurve(0, 4096)
  distortion.oversample = "2x"
  const distortionAmount = ctx.createGain()
  distortionAmount.gain.value = 1

  // System filter (switchable lowpass/highpass)
  const sysFilter = ctx.createBiquadFilter()
  sysFilter.type = "lowpass"
  sysFilter.frequency.value = 18000
  sysFilter.Q.value = 1

  // fxBus: after filter, splits to delay/echo/loop/reverb and dry
  const fxBus = ctx.createGain()
  fxBus.gain.value = 1

  // Serial chain: voicesBus → eq → dist → sysFilter → fxBus
  voicesBus.connect(eqLow)
  eqLow.connect(eqMid)
  eqMid.connect(eqHigh)
  eqHigh.connect(distortion)
  distortion.connect(distortionAmount)
  distortionAmount.connect(sysFilter)
  sysFilter.connect(fxBus)

  // --- Parallel sends from fxBus ---

  // Dry
  const dryGain = ctx.createGain()
  dryGain.gain.value = 0.55
  fxBus.connect(dryGain)
  dryGain.connect(masterGain)

  // Delay with feedback
  const baseDelayTime = Math.min(emotions[0]?.synthParams.delayTime ?? 0.25, 0.6)
  const delayNode = ctx.createDelay(2)
  delayNode.delayTime.value = baseDelayTime
  const delayFeedback = ctx.createGain()
  delayFeedback.gain.value = 0.35
  const delayWet = ctx.createGain()
  delayWet.gain.value = 0.25
  fxBus.connect(delayNode)
  delayNode.connect(delayFeedback)
  delayFeedback.connect(delayNode)
  delayNode.connect(delayWet)
  delayWet.connect(masterGain)

  // Multi-tap echo
  const echoTap1 = ctx.createDelay(2)
  echoTap1.delayTime.value = 0.18
  const echoTap2 = ctx.createDelay(2)
  echoTap2.delayTime.value = 0.42
  const echoTap3 = ctx.createDelay(2)
  echoTap3.delayTime.value = 0.67
  const echoGain1 = ctx.createGain()
  echoGain1.gain.value = 1
  const echoGain2 = ctx.createGain()
  echoGain2.gain.value = 0.55
  const echoGain3 = ctx.createGain()
  echoGain3.gain.value = 0.3
  const echoPan1 = ctx.createStereoPanner()
  echoPan1.pan.value = -0.4
  const echoPan2 = ctx.createStereoPanner()
  echoPan2.pan.value = 0.3
  const echoPan3 = ctx.createStereoPanner()
  echoPan3.pan.value = -0.5
  const echoWet = ctx.createGain()
  echoWet.gain.value = 0
  fxBus.connect(echoTap1)
  fxBus.connect(echoTap2)
  fxBus.connect(echoTap3)
  echoTap1.connect(echoGain1)
  echoTap2.connect(echoGain2)
  echoTap3.connect(echoGain3)
  echoGain1.connect(echoPan1)
  echoGain2.connect(echoPan2)
  echoGain3.connect(echoPan3)
  echoPan1.connect(echoWet)
  echoPan2.connect(echoWet)
  echoPan3.connect(echoWet)
  echoWet.connect(masterGain)

  // Loop (freeze-style)
  const loopLength = 2
  const loopDelay = ctx.createDelay(loopLength + 1)
  loopDelay.delayTime.value = loopLength
  const loopInGain = ctx.createGain()
  loopInGain.gain.value = 0.6
  const loopFeedback = ctx.createGain()
  loopFeedback.gain.value = 0.0
  const loopWet = ctx.createGain()
  loopWet.gain.value = 0.0
  fxBus.connect(loopInGain)
  loopInGain.connect(loopDelay)
  loopDelay.connect(loopFeedback)
  loopFeedback.connect(loopDelay)
  loopDelay.connect(loopWet)
  loopWet.connect(masterGain)

  // Reverb
  const maxDecay = Math.max(...emotions.map((e) => e.synthParams.reverbDecay), 1)
  const reverbSize = Math.min(maxDecay + 0.5, 4)
  const convolver = ctx.createConvolver()
  convolver.buffer = createImpulseResponse(ctx, reverbSize, maxDecay * 0.6)
  const reverbWet = ctx.createGain()
  reverbWet.gain.value = 0.3
  fxBus.connect(convolver)
  convolver.connect(reverbWet)
  reverbWet.connect(masterGain)

  // --- Voices ---
  const voices: VoiceNodes[] = []

  emotions.forEach((emotion, i) => {
    const p = emotion.synthParams
    const startTime = now + i * 0.3

    let source: OscillatorNode | AudioBufferSourceNode
    if (p.waveform === "noise") {
      const bufferSource = ctx.createBufferSource()
      bufferSource.buffer = createNoiseBuffer(ctx, 10)
      bufferSource.loop = true
      source = bufferSource
    } else {
      const osc = ctx.createOscillator()
      osc.type = p.waveform
      osc.frequency.value = p.frequency
      osc.detune.value = p.detune + i * 5
      source = osc
    }

    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = p.filterFreq
    filter.Q.value = Math.min(p.filterQ, 12)

    const lfo = ctx.createOscillator()
    lfo.type = "sine"
    lfo.frequency.value = p.lfoRate
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = p.filterFreq * p.lfoDepth * 0.3
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(p.amplitude * 0.8, startTime + p.attack)

    const panner = ctx.createStereoPanner()
    panner.pan.value = p.pan

    source.connect(filter)
    filter.connect(gain)
    gain.connect(panner)
    panner.connect(voicesBus)

    source.start(startTime)
    lfo.start(startTime)

    voices.push({
      source,
      filter,
      gain,
      panner,
      lfo,
      lfoGain,
      baseFilterFreq: p.filterFreq,
      baseAmplitude: p.amplitude * 0.8,
      basePan: p.pan,
    })
  })

  // Waveform data pump
  let animFrame = 0
  if (onWaveformData) {
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    const pump = () => {
      analyser.getByteTimeDomainData(dataArray)
      const normalized = Array.from(dataArray).map((v) => (v - 128) / 128)
      onWaveformData(normalized)
      animFrame = requestAnimationFrame(pump)
    }
    pump()
  }

  // --- Effects state tracking ---
  const effectsState: EffectsState = {
    reverb: { mix: 0.3, size: reverbSize },
    delay: { time: baseDelayTime, feedback: 0.35 },
    echo: { level: 0, spread: 0.4 },
    eq: { low: 0, mid: 0, high: 0 },
    filter: { type: "lowpass", cutoff: 18000, resonance: 1 },
    distortion: { drive: 0 },
    loop: { active: false, length: loopLength },
  }

  let lastEffectsBroadcast = 0
  function broadcastEffects() {
    if (!onEffectsState) return
    const now = performance.now()
    if (now - lastEffectsBroadcast < 80) return
    lastEffectsBroadcast = now
    onEffectsState({
      reverb: { ...effectsState.reverb },
      delay: { ...effectsState.delay },
      echo: { ...effectsState.echo },
      eq: { ...effectsState.eq },
      filter: { ...effectsState.filter },
      distortion: { ...effectsState.distortion },
      loop: { ...effectsState.loop },
    })
  }

  let stopped = false
  let prevLoopActive = false

  return {
    analyser,
    stop: () => {
      if (stopped) return
      stopped = true
      cancelAnimationFrame(animFrame)

      voices.forEach((v) => {
        try { v.gain.gain.cancelScheduledValues(0); v.gain.gain.value = 0 } catch {}
        try { v.source.stop() } catch {}
        try { v.lfo.stop() } catch {}
        try { v.source.disconnect() } catch {}
        try { v.filter.disconnect() } catch {}
        try { v.gain.disconnect() } catch {}
        try { v.panner.disconnect() } catch {}
      })
      try { masterGain.disconnect() } catch {}
      ctx.close().catch(() => {})
    },
    updateMotion: (data: MotionData) => {
      if (stopped) return
      const t = ctx.currentTime
      const smoothing = 0.08

      // --- Voice-level motion (existing behavior) ---
      voices.forEach((v) => {
        const targetFreq = 200 + data.verticalPosition * (v.baseFilterFreq * 2)
        v.filter.frequency.setTargetAtTime(targetFreq, t, smoothing)

        const targetGain = v.baseAmplitude * (0.6 + data.movementIntensity * 0.8)
        v.gain.gain.setTargetAtTime(targetGain, t, smoothing)
        v.filter.Q.setTargetAtTime(1 + data.movementIntensity * 10, t, smoothing)

        const targetPan = Math.max(-1, Math.min(1, v.basePan + data.horizontalPosition * 0.8))
        v.panner.pan.setTargetAtTime(targetPan, t, smoothing)
      })

      // --- Body metaphors → FX rack ---

      // Spread → reverb mix + reverb wet + echo space (coherent "distance/space" axis)
      const reverbMix = 0.15 + data.spread * 0.7
      reverbWet.gain.setTargetAtTime(reverbMix, t, 0.12)
      dryGain.gain.setTargetAtTime(0.7 - data.spread * 0.3, t, 0.12)
      effectsState.reverb.mix = reverbMix

      const echoLevel = Math.max(0, data.spread - 0.25) * 0.85
      echoWet.gain.setTargetAtTime(echoLevel, t, 0.12)
      const echoSpread = data.spread
      echoPan1.pan.setTargetAtTime(-0.3 - echoSpread * 0.7, t, 0.12)
      echoPan2.pan.setTargetAtTime(echoSpread * 0.5, t, 0.12)
      echoPan3.pan.setTargetAtTime(-0.4 - echoSpread * 0.6, t, 0.12)
      effectsState.echo.level = echoLevel
      effectsState.echo.spread = echoSpread

      // Intensity → distortion + delay (coherent "energy" axis)
      const drive = Math.min(data.movementIntensity * 0.85, 0.85)
      if (drive > 0.02) {
        distortion.curve = createDistortionCurve(drive, 2048)
      }
      distortionAmount.gain.setTargetAtTime(dbToGain(drive * 8), t, 0.1)
      effectsState.distortion.drive = drive

      const delayFb = 0.2 + data.movementIntensity * 0.55
      delayFeedback.gain.setTargetAtTime(delayFb, t, 0.15)
      const delayMix = 0.15 + data.movementIntensity * 0.35
      delayWet.gain.setTargetAtTime(delayMix, t, 0.15)
      effectsState.delay.feedback = delayFb
      effectsState.delay.time = delayNode.delayTime.value

      // Height → system filter cutoff (theremin brightness), resonance subtle from intensity
      const cutoff = 300 + data.verticalPosition * 17000
      sysFilter.frequency.setTargetAtTime(cutoff, t, 0.08)
      const reso = 1 + data.movementIntensity * 6
      sysFilter.Q.setTargetAtTime(reso, t, 0.1)
      effectsState.filter.cutoff = cutoff
      effectsState.filter.resonance = reso
      effectsState.filter.type = sysFilter.type as "lowpass" | "highpass"

      // Loop freeze from bothHandsHigh
      const g = data.gestures
      if (g.bothHandsHigh !== prevLoopActive) {
        prevLoopActive = g.bothHandsHigh
        if (g.bothHandsHigh) {
          loopFeedback.gain.setTargetAtTime(0.98, t, 0.02)
          loopInGain.gain.setTargetAtTime(0, t, 0.2)
          loopWet.gain.setTargetAtTime(0.8, t, 0.1)
        } else {
          loopFeedback.gain.setTargetAtTime(0, t, 0.4)
          loopInGain.gain.setTargetAtTime(0.6, t, 0.2)
          loopWet.gain.setTargetAtTime(0, t, 0.4)
        }
        effectsState.loop.active = g.bothHandsHigh
      }

      broadcastEffects()
    },
    getEffectsState: () => effectsState,
  }
}
