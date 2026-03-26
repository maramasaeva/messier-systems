export interface Track {
  title: string
  duration?: string
}

export interface Release {
  title: string
  type: "ep" | "album" | "single"
  releaseDate: string
  tracks: Track[]
  links: {
    bandcamp?: string
    spotify?: string
    appleMusic?: string
  }
}

export const discography: Release[] = [
  {
    title: "perseverance",
    type: "ep",
    releaseDate: "march 27, 2026",
    tracks: [
      { title: "unfed", duration: "2:15" },
      { title: "spinel" },
      { title: "ryuhyo" },
      { title: "pain i" },
      { title: "pain ii" },
      { title: "clean" },
      { title: "nu" },
      { title: "restless" },
      { title: "n-JOY" },
      { title: "un" },
    ],
    links: {
      bandcamp: "https://mmessier.bandcamp.com/album/perseverance",
      spotify: "https://open.spotify.com/artist/2jzQP1uGUsHFUg0OheUt5W",
      appleMusic: "https://music.apple.com/be/artist/messier/1844705773",
    },
  },
  {
    title: "circuitries",
    type: "album",
    releaseDate: "july 18, 2025",
    tracks: [
      { title: "our god in the sewers", duration: "4:11" },
      { title: "post world war beauty", duration: "4:28" },
      { title: "ecsane", duration: "1:52" },
      { title: "0", duration: "6:34" },
      { title: "pipes and timbres", duration: "4:31" },
      { title: "intellect", duration: "2:20" },
      { title: "it must be hazarded to poetry", duration: "3:18" },
      { title: "multitudes", duration: "3:30" },
      { title: "return to the necrospace", duration: "3:29" },
    ],
    links: {
      spotify: "https://open.spotify.com/artist/2jzQP1uGUsHFUg0OheUt5W",
      appleMusic: "https://music.apple.com/be/artist/messier/1844705773",
    },
  },
  {
    title: "fantasy sketch",
    type: "single",
    releaseDate: "2025",
    tracks: [{ title: "fantasy sketch" }],
    links: {
      spotify: "https://open.spotify.com/artist/2jzQP1uGUsHFUg0OheUt5W",
    },
  },
]

export const streamingLinks = {
  bandcamp: "https://mmessier.bandcamp.com",
  spotify: "https://open.spotify.com/artist/2jzQP1uGUsHFUg0OheUt5W",
  appleMusic: "https://music.apple.com/be/artist/messier/1844705773",
  soundcloud: "https://soundcloud.com/maraexe",
}
