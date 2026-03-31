import type { Metadata } from "next"
import ResumeContent from "./resume-content"

export const metadata: Metadata = {
  title: "mara masaeva - resume",
  description: "ai engineer, music producer, writer. building sonic systems for feeling machines.",
}

export default function ResumePage() {
  return <ResumeContent />
}
