export type LaunchableWindow =
  | "about"
  | "work"
  | "contact"
  | "music"
  | "tools"
  | "writing"
  | "epk"
  | "activity"

export type Tablet = {
  id: number
  kind: "window" | "route"
  key: string // window type, or route href
  label: string
  size: "medium" | "large"
  position: [number, number, number]
}
