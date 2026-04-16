import type { MotionData } from "@/types/sc-generator"
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"

interface MotionTracker {
  start: () => Promise<void>
  stop: () => void
  onFrame: (callback: (data: MotionData) => void) => void
  getVideoElement: () => HTMLVideoElement
  isActive: () => boolean
}

export async function createMotionTracker(): Promise<MotionTracker> {
  let handLandmarker: HandLandmarker | null = null
  let stream: MediaStream | null = null
  let animFrame = 0
  let active = false
  let frameCallback: ((data: MotionData) => void) | null = null
  let prevLandmarks: number[][] | null = null

  const video = document.createElement("video")
  video.setAttribute("playsinline", "")
  video.setAttribute("autoplay", "")
  video.muted = true
  video.style.transform = "scaleX(-1)" // mirror

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

  function extractMotionData(
    landmarks: number[][]
  ): MotionData {
    if (landmarks.length === 0) {
      return {
        movementIntensity: 0,
        horizontalPosition: 0,
        verticalPosition: 0.5,
        spread: 0,
      }
    }

    // Average position of all landmarks
    let avgX = 0
    let avgY = 0
    let minX = 1
    let maxX = 0
    let minY = 1
    let maxY = 0

    for (const [x, y] of landmarks) {
      avgX += x
      avgY += y
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
    avgX /= landmarks.length
    avgY /= landmarks.length

    // Movement intensity: compare to previous frame
    let movementIntensity = 0
    if (prevLandmarks && prevLandmarks.length === landmarks.length) {
      let totalDelta = 0
      for (let i = 0; i < landmarks.length; i++) {
        const dx = landmarks[i][0] - prevLandmarks[i][0]
        const dy = landmarks[i][1] - prevLandmarks[i][1]
        totalDelta += Math.sqrt(dx * dx + dy * dy)
      }
      movementIntensity = Math.min(totalDelta / landmarks.length * 15, 1)
    }
    prevLandmarks = landmarks

    // Horizontal: -1 (right of screen / left hand side mirrored) to 1
    const horizontalPosition = (avgX - 0.5) * -2

    // Vertical: 0 (bottom) to 1 (top)
    const verticalPosition = 1 - avgY

    // Spread: how far apart hands/fingers are
    const spread = Math.min(Math.max(maxX - minX, maxY - minY) * 2, 1)

    return { movementIntensity, horizontalPosition, verticalPosition, spread }
  }

  function processFrame() {
    if (!active || !handLandmarker || !video.videoWidth) {
      if (active) animFrame = requestAnimationFrame(processFrame)
      return
    }

    const result = handLandmarker.detectForVideo(video, performance.now())
    const allLandmarks: number[][] = []

    if (result.landmarks) {
      for (const hand of result.landmarks) {
        for (const point of hand) {
          allLandmarks.push([point.x, point.y, point.z])
        }
      }
    }

    const data = extractMotionData(allLandmarks)
    if (frameCallback) frameCallback(data)

    animFrame = requestAnimationFrame(processFrame)
  }

  return {
    start: async () => {
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
      video.srcObject = null
      handLandmarker?.close()
      handLandmarker = null
    },
    onFrame: (callback) => {
      frameCallback = callback
    },
    getVideoElement: () => video,
    isActive: () => active,
  }
}
