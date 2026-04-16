import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW = 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

const EMOTION_COLORS: Record<string, string> = {
  joy: "#c8f060",
  sorrow: "#6080f0",
  anger: "#f06060",
  fear: "#a060f0",
  love: "#f060a0",
  chaos: "#f0a060",
  calm: "#60c8f0",
  decay: "#808060",
  longing: "#c890f0",
  dream: "#90f0c8",
  tension: "#f0f060",
  wonder: "#60f0a0",
}

const SYSTEM_PROMPT = `You are an expert SuperCollider programmer, sound designer, and poetry analyst for the sc_generator project. You receive a poem and produce both emotional analysis and SuperCollider code.

EMOTIONAL ANALYSIS:
- Detect 2-4 dominant emotions from the poem's content, imagery, and tone
- Choose from: joy, sorrow, anger, fear, love, chaos, calm, decay, longing, dream, tension, wonder
- Assign confidence scores (0-1) that sum to approximately 1.0
- Extract 1-3 specific words from the poem that evidence each emotion

WEB AUDIO SYNTHESIS PARAMETERS — for each emotion, provide parameters that will drive browser-based synthesis:
- waveform: one of "sine", "sawtooth", "square", "triangle", "noise"
- frequency: base Hz (40-2000, lower for dark emotions, higher for bright)
- detune: cents (-50 to 50)
- filterFreq: lowpass cutoff Hz (200-8000)
- filterQ: resonance (0.5-15)
- reverbMix: wet/dry (0-1, higher for spacious emotions)
- reverbDecay: seconds (0.5-4)
- delayTime: seconds (0-0.5)
- delayFeedback: 0-0.8
- attack: envelope attack seconds (0.01-2)
- sustain: seconds (1-8)
- release: seconds (0.5-6)
- amplitude: 0-1 (scale by confidence)
- pan: stereo (-1 to 1)
- lfoRate: Hz (0.1-10)
- lfoDepth: 0-1

SUPERCOLLIDER CODE:
Generate valid, runnable SuperCollider code that interprets the poem musically. Rules:
- Start with s.boot; and s.waitForBoot { ... }
- Use SynthDef with proper syntax: SynthDef(\\name, { |args| ... }).add;
- Use EnvGen with doneAction: 2
- Use oscillators creatively: SinOsc, Saw, VarSaw, Pulse, LFTri, LFNoise0, LFNoise1
- Apply effects: FreeVerb, AllpassC, DelayL, Pan2, BPF, RLPF
- Use Pbind with Pseq for rhythmic patterns
- Keep pieces 15-30 seconds
- Output stereo via Out.ar(0, ...)
- Make the code musically interesting and emotionally resonant

Also provide a one-line musical caption describing what the generated piece sounds like.

RESPONSE FORMAT — return ONLY valid JSON, no markdown fences:
{
  "emotions": [
    {
      "emotion": "...",
      "confidence": 0.X,
      "keywords": ["word1", "word2"],
      "synthParams": { "waveform": "...", "frequency": ..., ... }
    }
  ],
  "scCode": "// SuperCollider code here...",
  "caption": "One-line description of the sound..."
}`

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 })
  }

  let body: { poem?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const poem = typeof body.poem === "string" ? body.poem.replace(/<[^>]*>/g, "").trim() : ""
  if (!poem || poem.length > 2000) {
    return NextResponse.json({ error: "Poem must be 1-2000 characters" }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "API not configured" }, { status: 503 })
  }

  try {
    const client = new OpenAI({ apiKey })
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: poem },
      ],
      max_tokens: 4096,
      temperature: 0.8,
    })

    const raw = completion.choices[0]?.message?.content || ""
    const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim()

    let data
    try {
      data = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 502 })
    }

    // Add colors to emotions
    if (Array.isArray(data.emotions)) {
      data.emotions = data.emotions.map((e: { emotion?: string }) => ({
        ...e,
        color: EMOTION_COLORS[e.emotion || ""] || "#888880",
      }))
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("OpenAI API error:", err)
    return NextResponse.json({ error: "AI generation failed" }, { status: 502 })
  }
}
