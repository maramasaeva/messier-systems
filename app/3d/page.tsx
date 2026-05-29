import type { Metadata } from "next"
import Workstation from "./Workstation"

export const metadata: Metadata = {
  title: "messier // terminal",
  description:
    "3D CRT workstation — an experimental spatial interface for messier systems.",
  robots: { index: false, follow: false },
}

export default function Page() {
  return <Workstation />
}
