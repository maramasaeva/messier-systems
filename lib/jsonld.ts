import { epkData } from "@/data/epk"

export function getPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mara Masaeva",
    alternateName: ["messier", "Mara Messier"],
    description:
      "AI engineer, electronic music producer, and writer building production AI systems, generative sound, and agentic architectures.",
    url: "https://messier-systems.vercel.app",
    image: "https://messier-systems.vercel.app/opengraph-image",
    jobTitle: "Creative AI Engineer",
    worksFor: [
      {
        "@type": "Organization",
        name: "Friends of Cartel",
        url: "https://friendsofcartel.com",
      },
      {
        "@type": "Organization",
        name: "Kotopia",
        url: "https://k-o.to/",
      },
    ],
    alumniOf: [
      {
        "@type": "EducationalOrganization",
        name: "KU Leuven",
        department: "Artificial Intelligence",
      },
      {
        "@type": "EducationalOrganization",
        name: "University of Antwerp",
        department: "Digital Text Analysis",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Leuven",
      addressCountry: "BE",
    },
    knowsAbout: [
      ...epkData.skills.core,
      ...epkData.skills.languages,
      ...epkData.skills.frameworks,
      "electronic music production",
      "live coding",
      "creative technology",
    ],
    sameAs: [
      epkData.contact.socials.github,
      epkData.contact.socials.linkedin,
      epkData.contact.socials.twitter,
      epkData.contact.socials.instagram,
      epkData.contact.socials.goodreads,
      epkData.music.streaming.spotify,
      epkData.music.streaming.bandcamp,
      epkData.writing.substack,
    ],
    gender: "Non-binary",
    pronouns: "they/them",
  }
}

export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "messier systems",
    url: "https://messier-systems.vercel.app",
    description:
      "Personal website of Mara Masaeva — AI engineer, electronic music producer, and writer.",
    author: {
      "@type": "Person",
      name: "Mara Masaeva",
    },
  }
}

export function getMusicGroupJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: "messier",
    description:
      "Electronic music project by Mara Masaeva. IDM, ambient, jungle, noise, dark wave, spoken word.",
    genre: epkData.music.genres,
    url: epkData.music.streaming.bandcamp,
    sameAs: [
      epkData.music.streaming.spotify,
      epkData.music.streaming.appleMusic,
      epkData.music.streaming.soundcloud,
      epkData.music.streaming.bandcamp,
    ],
    member: {
      "@type": "Person",
      name: "Mara Masaeva",
    },
    album: epkData.music.releases
      .filter((r) => r.type === "album" || r.type === "ep")
      .map((r) => ({
        "@type": "MusicAlbum",
        name: r.title,
        albumReleaseType: r.type === "album" ? "AlbumRelease" : "EPRelease",
        datePublished: r.date,
        numTracks: r.trackCount,
        description: r.description,
      })),
  }
}
