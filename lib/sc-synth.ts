import type { EmotionResult, MotionData } from "@/types/sc-generator"

interface VoiceNodes {
  source: OscillatorNode | AudioBufferSourceNode
  filter: BiquadFilterNode
  gain: GainNode
  panner: StereoPannerNode
  lfo: OscillatorNode
  lfoGain: GainNode
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

  // Master chain: soft clipper → analyser → destination
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.6

  const clipper = ctx.createWaveShaper()
  clipper.curve = createSoftClipCurve(4096)
  clipper.oversample = "2x"

  const analyser = ctx.createAnalyser()
  analyser.fftSize = 128
  analyser.smoothingTimeConstant = 0.8

  masterGain.connect(clipper)
  clipper.connect(analyser)
  analyser.connect(ctx.destination)

  // Shared reverb convolver
  const convolver = ctx.createConvolver()
  const maxDecay = Math.max(...emotions.map((e) => e.synthParams.reverbDecay))
  convolver.buffer = createImpulseResponse(ctx, Math.min(maxDecay + 0.5, 4), maxDecay * 0.6)

  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.3
  convolver.connect(reverbGain)
  reverbGain.connect(masterGain)

  const dryGain = ctx.createGain()
  dryGain.gain.value = 0.7
  dryGain.connect(masterGain)

  const voices: VoiceNodes[] = []
  const totalDuration = 14

  emotions.forEach((emotion, i) => {
    const p = emotion.synthParams
    const startOffset = i * 0.2
    const startTime = now + startOffset

    // Create source
    let source: OscillatorNode | AudioBufferSourceNode
    if (p.waveform === "noise") {
      const bufferSource = ctx.createBufferSource()
      bufferSource.buffer = createNoiseBuffer(ctx, totalDuration + 2)
      bufferSource.loop = true
      source = bufferSource
    } else {
      const osc = ctx.createOscillator()
      osc.type = p.waveform
      osc.frequency.value = p.frequency
      osc.detune.value = p.detune + i * 3
      source = osc
    }

    // Filter
    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = p.filterFreq
    filter.Q.value = p.filterQ

    // LFO → filter frequency
    const lfo = ctx.createOscillator()
    lfo.type = "sine"
    lfo.frequency.value = p.lfoRate
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = p.filterFreq * p.lfoDepth * 0.5
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    // Gain (ADSR envelope)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(p.amplitude, startTime + p.attack)
    gain.gain.setValueAtTime(p.amplitude, startTime + p.attack + p.sustain)
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      startTime + p.attack + p.sustain + p.release
    )

    // Filter envelope: open during attack
    filter.frequency.setValueAtTime(p.filterFreq * 0.3, startTime)
    filter.frequency.linearRampToValueAtTime(p.filterFreq, startTime + p.attack * 1.5)

    // Delay with feedback
    const delay = ctx.createDelay(1)
    delay.delayTime.value = p.delayTime
    const feedbackGain = ctx.createGain()
    feedbackGain.gain.value = p.delayFeedback
    delay.connect(feedbackGain)
    feedbackGain.connect(delay)

    // Panner
    const panner = ctx.createStereoPanner()
    panner.pan.value = p.pan

    // Connect chain: source → filter → gain → delay → panner → dry/reverb
    source.connect(filter)
    filter.connect(gain)
    gain.connect(delay)
    gain.connect(panner) // direct signal
    delay.connect(panner) // delayed signal
    panner.connect(dryGain)
    panner.connect(convolver)

    // Start
    source.start(startTime)
    lfo.start(startTime)

    // Stop after envelope completes
    const stopTime = startTime + p.attack + p.sustain + p.release + 0.5
    if (source instanceof OscillatorNode) {
      source.stop(stopTime)
    } else {
      source.stop(stopTime)
    }
    lfo.stop(stopTime)

    voices.push({ source, filter, gain, panner, lfo, lfoGain })
  })

  // Waveform data callback
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

  // Auto-stop after total duration
  const stopTimeout = setTimeout(() => {
    cancelAnimationFrame(animFrame)
    ctx.close()
  }, (totalDuration + 2) * 1000)

  return {
    analyser,
    stop: () => {
      clearTimeout(stopTimeout)
      cancelAnimationFrame(animFrame)
      voices.forEach((v) => {
        try {
          v.source.stop()
          v.lfo.stop()
        } catch {
          // already stopped
        }
      })
      ctx.close()
    },
    updateMotion: (data: MotionData) => {
      const t = ctx.currentTime
      // Movement intensity → master gain + filter resonance
      masterGain.gain.setTargetAtTime(0.4 + data.movementIntensity * 0.5, t, 0.1)
      voices.forEach((v) => {
        // Vertical position → filter cutoff
        const baseFreq = v.filter.frequency.value
        v.filter.frequency.setTargetAtTime(
          200 + data.verticalPosition * 7800,
          t,
          0.08
        )
        // Filter resonance from movement
        v.filter.Q.setTargetAtTime(0.5 + data.movementIntensity * 12, t, 0.1)
        // Horizontal → pan
        v.panner.pan.setTargetAtTime(data.horizontalPosition, t, 0.1)
      })
      // Spread → reverb mix
      reverbGain.gain.setTargetAtTime(data.spread * 0.8, t, 0.15)
      dryGain.gain.setTargetAtTime(1 - data.spread * 0.5, t, 0.15)
    },
  }
}
