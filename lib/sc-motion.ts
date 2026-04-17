import type { MotionData, GestureState } from "@/types/sc-generator"
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"

interface MotionTracker {
  start: (videoEl: HTMLVideoElement) => Promise<void>
  stop: () => void
  onFrame: (callback: (data: MotionData, landmarks: number[][][]) => void) => void
  isActive: () => boolean
}

type Point = { x: number; y: number; z: number }
type Hand = Point[]

const HOLD_FRAMES = 12
const COOLDOWN_FRAMES = 40
const HIGH_THRESHOLD = 0.28

export async function createMotionTracker(): Promise<MotionTracker> {
  let handLandmarker: HandLandmarker | null = null
  let stream: MediaStream | null = null
  let animFrame = 0
  let active = false
  let frameCallback: ((data: MotionData, landmarks: number[][][]) => void) | null = null
  let prevFlatLandmarks: number[][] | null = null
  let videoEl: HTMLVideoElement | null = null

  let bothHandsHighLatched = false
  let bothHandsHighTimer = 0

  async function initHandLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    )
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })
  }

  function handCentroid(hand: Hand): { x: number; y: number } {
    let x = 0
    let y = 0
    for (const p of hand) {
      x += p.x
      y += p.y
    }
    return { x: x / hand.length, y: y / hand.length }
  }

  function extractGestures(hands: Hand[]): GestureState {
    const centroids = hands.length >= 2 ? hands.map(handCentroid) : []
    const bothHigh = centroids.length >= 2 && centroids.every((c) => c.y < HIGH_THRESHOLD)

    if (bothHandsHighTimer < 0) {
      bothHandsHighTimer++
    } else if (bothHigh) {
      bothHandsHighTimer++
      if (bothHandsHighTimer > HOLD_FRAMES) {
        bothHandsHighLatched = !bothHandsHighLatched
        bothHandsHighTimer = -COOLDOWN_FRAMES
      }
    } else {
      bothHandsHighTimer = 0
    }

    const progress =
      bothHandsHighTimer > 0 ? Math.min(bothHandsHighTimer / HOLD_FRAMES, 1) : 0

    return {
      bothHandsHigh: bothHandsHighLatched,
      bothHandsHighProgress: progress,
    }
  }

  function extractMotionData(hands: Hand[]): MotionData {
    const flat: number[][] = []
    for (const hand of hands) {
      for (const p of hand) flat.push([p.x, p.y, p.z])
    }

    if (flat.length === 0) {
      return {
        movementIntensity: 0,
        horizontalPosition: 0,
        verticalPosition: 0.5,
        spread: 0,
        gestures: extractGestures([]),
      }
    }

    let avgX = 0
    let avgY = 0
    let minX = 1
    let maxX = 0
    let minY = 1
    let maxY = 0

    for (const [x, y] of flat) {
      avgX += x
      avgY += y
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
    avgX /= flat.length
    avgY /= flat.length

    let movementIntensity = 0
    if (prevFlatLandmarks && prevFlatLandmarks.length === flat.length) {
      let totalDelta = 0
      for (let i = 0; i < flat.length; i++) {
        const dx = flat[i][0] - prevFlatLandmarks[i][0]
        const dy = flat[i][1] - prevFlatLandmarks[i][1]
        totalDelta += Math.sqrt(dx * dx + dy * dy)
      }
      movementIntensity = Math.min((totalDelta / flat.length) * 15, 1)
    }
    prevFlatLandmarks = flat

    const horizontalPosition = (avgX - 0.5) * -2
    const verticalPosition = 1 - avgY
    const spread = Math.min(Math.max(maxX - minX, maxY - minY) * 2, 1)

    return {
      movementIntensity,
      horizontalPosition,
      verticalPosition,
      spread,
      gestures: extractGestures(hands),
    }
  }

  function processFrame() {
    if (!active || !handLandmarker || !videoEl || !videoEl.videoWidth) {
      if (active) animFrame = requestAnimationFrame(processFrame)
      return
    }

    const result = handLandmarker.detectForVideo(videoEl, performance.now())
    const hands: Hand[] = []

    if (result.landmarks) {
      for (const hand of result.landmarks) {
        hands.push(hand.map((p) => ({ x: p.x, y: p.y, z: p.z })))
      }
    }

    const data = extractMotionData(hands)
    const landmarks: number[][][] = hands.map((h) => h.map((p) => [p.x, p.y, p.z]))
    if (frameCallback) frameCallback(data, landmarks)

    animFrame = requestAnimationFrame(processFrame)
  }

  return {
    start: async (video: HTMLVideoElement) => {
      videoEl = video
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
        })
        video.srcObject = stream
        await video.play()
        await initHandLandmarker()
        active = true
        processFrame()
      } catch (err) {
        console.warn("Camera not available:", err)
        throw err
      }
    },
    stop: () => {
      active = false
      cancelAnimationFrame(animFrame)
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
        stream = null
      }
      if (videoEl) videoEl.srcObject = null
      handLandmarker?.close()
      handLandmarker = null
    },
    onFrame: (callback) => {
      frameCallback = callback
    },
    isActive: () => active,
  }
}
