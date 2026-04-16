import type { EmotionResult, MotionData } from "@/types/sc-generator"

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

export function playSynthesis(
  emotions: EmotionResult[],
  onWaveformData?: (data: number[]) => void
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

  // Reverb
  const convolver = ctx.createConvolver()
  const maxDecay = Math.max(...emotions.map((e) => e.synthParams.reverbDecay), 1)
  convolver.buffer = createImpulseResponse(ctx, Math.min(maxDecay + 0.5, 4), maxDecay * 0.6)

  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.35
  convolver.connect(reverbGain)
  reverbGain.connect(masterGain)

  const dryGain = ctx.createGain()
  dryGain.gain.value = 0.65
  dryGain.connect(masterGain)

  const voices: VoiceNodes[] = []

  emotions.forEach((emotion, i) => {
    const p = emotion.synthParams
    const startTime = now + i * 0.3

    // Source — runs indefinitely (no stop time)
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

    // Filter
    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = p.filterFreq
    filter.Q.value = Math.min(p.filterQ, 12)

    // LFO → filter frequency modulation
    const lfo = ctx.createOscillator()
    lfo.type = "sine"
    lfo.frequency.value = p.lfoRate
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = p.filterFreq * p.lfoDepth * 0.3
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    // Gain — fade in, then sustain indefinitely
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(p.amplitude * 0.8, startTime + p.attack)
    // No release scheduled — sound sustains until stop() is called

    // Delay with feedback
    const delay = ctx.createDelay(1)
    delay.delayTime.value = Math.min(p.delayTime, 0.5)
    const feedbackGain = ctx.createGain()
    feedbackGain.gain.value = Math.min(p.delayFeedback, 0.7)
    delay.connect(feedbackGain)
    feedbackGain.connect(delay)

    // Panner
    const panner = ctx.createStereoPanner()
    panner.pan.value = p.pan

    // Connect: source → filter → gain → [delay + direct] → panner → dry/reverb
    source.connect(filter)
    filter.connect(gain)
    gain.connect(delay)
    gain.connect(panner)
    delay.connect(panner)
    panner.connect(dryGain)
    panner.connect(convolver)

    // Start — no stop time, runs forever
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

  let stopped = false

  return {
    analyser,
    stop: () => {
      if (stopped) return
      stopped = true
      cancelAnimationFrame(animFrame)

      // Immediately stop all sources and disconnect
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

      voices.forEach((v) => {
        // Vertical → filter cutoff (hand up = brighter)
        const targetFreq = 200 + data.verticalPosition * (v.baseFilterFreq * 2)
        v.filter.frequency.setTargetAtTime(targetFreq, t, smoothing)

        // Movement intensity → gain boost + filter resonance
        const targetGain = v.baseAmplitude * (0.6 + data.movementIntensity * 0.8)
        v.gain.gain.setTargetAtTime(targetGain, t, smoothing)
        v.filter.Q.setTargetAtTime(1 + data.movementIntensity * 10, t, smoothing)

        // Horizontal → pan
        const targetPan = Math.max(-1, Math.min(1, v.basePan + data.horizontalPosition * 0.8))
        v.panner.pan.setTargetAtTime(targetPan, t, smoothing)
      })

      // Spread → reverb mix
      reverbGain.gain.setTargetAtTime(0.15 + data.spread * 0.7, t, 0.12)
      dryGain.gain.setTargetAtTime(0.85 - data.spread * 0.4, t, 0.12)
    },
  }
}
