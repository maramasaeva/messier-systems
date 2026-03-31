"use client"

import Link from "next/link"
import { epkData } from "../../data/epk"
import { discography } from "../../data/discography"

export default function EpkContent() {
  return (
    <div className="min-h-screen bg-black text-gray-300 font-mono">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          a { color: black !important; text-decoration: underline !important; }
          .text-pink-400, .text-green-400 { color: black !important; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 border-b border-gray-700 pb-8">
          <div className="text-pink-400 text-xs mb-4">$ cat epk.txt</div>
          <h1 className="text-3xl text-white mb-2">{epkData.bio.name}</h1>
          <div className="text-gray-400 mb-1">{epkData.bio.realName} · {epkData.bio.pronouns} · {epkData.bio.location}</div>
          <div className="text-green-400 text-lg mt-3">&quot;{epkData.bio.oneLiner}&quot;</div>
          <div className="text-gray-400 text-sm mt-1">{epkData.bio.tagline}</div>
        </div>

        {/* Bio */}
        <section className="mb-10">
          <h2 className="text-pink-400 text-sm mb-3">bio/</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{epkData.bio.description}</p>
        </section>

        {/* Experience */}
        <section className="mb-10">
          <h2 className="text-pink-400 text-sm mb-3">experience/</h2>
          <div className="space-y-6">
            {epkData.experience.map((exp, i) => (
              <div key={i} className="border-l border-gray-700 pl-4">
                <div className="text-white text-sm">
                  {exp.role}
                  <span className="text-gray-500"> @ {exp.url ? (
                    <a href={exp.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400">{exp.company}</a>
                  ) : exp.company}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{exp.period} · {exp.location}</div>
                <div className="space-y-1">
                  {exp.highlights.map((h, j) => (
                    <div key={j} className="text-xs text-gray-400 leading-relaxed">· {h}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="mb-10">
          <h2 className="text-pink-400 text-sm mb-3">education/</h2>
          <div className="space-y-3">
            {epkData.education.map((edu, i) => (
              <div key={i} className="border-l border-gray-700 pl-4">
                <div className="text-white text-sm">{edu.degree}</div>
                {edu.focus && <div className="text-xs text-gray-400">focus: {edu.focus}</div>}
                <div className="text-xs text-gray-500">{edu.institution} · {edu.period} · {edu.location}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="mb-10">
          <h2 className="text-pink-400 text-sm mb-3">skills/</h2>
          <div className="border-l border-gray-700 pl-4 space-y-3 text-xs">
            <div>
              <span className="text-gray-500">core: </span>
              <span className="text-gray-300">{epkData.skills.core.join(" · ")}</span>
            </div>
            <div>
              <span className="text-gray-500">languages: </span>
              <span className="text-gray-300">{epkData.skills.languages.join(" · ")}</span>
            </div>
            <div>
              <span className="text-gray-500">frameworks: </span>
              <span className="text-gray-300">{epkData.skills.frameworks.join(" · ")}</span>
            </div>
            <div>
              <span className="text-gray-500">infrastructure: </span>
              <span className="text-gray-300">{epkData.skills.infrastructure.join(" · ")}</span>
            </div>
            <div>
              <span className="text-gray-500">tools: </span>
              <span className="text-gray-300">{epkData.skills.tools.join(" · ")}</span>
            </div>
            <div>
              <span className="text-gray-500">human languages: </span>
              <span className="text-gray-300">{epkData.skills.humanLanguages.join(" · ")}</span>
            </div>
          </div>
        </section>

        {/* Tech Projects */}
        <section className="mb-10">
          <h2 className="text-pink-400 text-sm mb-3">projects/</h2>
          <div className="space-y-4">
            {epkData.tech.map((t, i) => (
              <div key={i} className="border-l border-gray-700 pl-4 text-sm">
                <div>
                  {t.url ? (
                    <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400">{t.project}</a>
                  ) : (
                    <span className="text-white">{t.project}</span>
                  )}
                  {t.role && <span className="text-gray-500"> : {t.role}</span>}
                </div>
                <div className="text-gray-500 text-xs">{t.description}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Music */}
        <section className="mb-10">
          <h2 className="text-pink-400 text-sm mb-3">music/</h2>
          <div className="text-xs text-gray-500 mb-3">genres: {epkData.music.genres.join(" · ")}</div>

          <div className="space-y-4">
            {discography.map((release) => (
              <div key={release.title} className="border-l border-gray-700 pl-4">
                <div className="text-white text-sm">
                  {release.title} <span className="text-gray-500">: {release.type}, {release.releaseDate}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                  {release.tracks.map((track, i) => (
                    <div key={i}>
                      {String(i + 1).padStart(2, "0")}. {track.title}{track.duration ? ` (${track.duration})` : ""}
                    </div>
                  ))}
                </div>
                <div className="mt-2 space-x-3 text-xs">
                  {release.links.bandcamp && (
                    <a href={release.links.bandcamp} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300">bandcamp</a>
                  )}
                  {release.links.spotify && (
                    <a href={release.links.spotify} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">spotify</a>
                  )}
                  {release.links.appleMusic && (
                    <a href={release.links.appleMusic} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">apple music</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live */}
        <section className="mb-10">
          <h2 className="text-pink-400 text-sm mb-3">live/</h2>
          {epkData.live.map((l, i) => (
            <div key={i} className="border-l border-gray-700 pl-4 text-sm">
              <div className="text-white">{l.event}</div>
              <div>&quot;{l.piece}&quot; w/ {l.collaborator}</div>
              <div className="text-gray-500 text-xs">{l.description}</div>
              <div className="text-gray-500 text-xs">tools: {l.tools.join(", ")}</div>
            </div>
          ))}
        </section>

        {/* Writing */}
        <section className="mb-10">
          <h2 className="text-pink-400 text-sm mb-3">writing/</h2>
          <div className="border-l border-gray-700 pl-4 text-sm">
            <div>
              <a href={epkData.writing.substack} target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400">{epkData.writing.publication}</a>
              <span className="text-gray-500"> : &quot;{epkData.writing.tagline}&quot;</span>
            </div>
            <div className="text-gray-500 text-xs">form: {epkData.writing.form}</div>
            <div className="text-gray-500 text-xs">themes: {epkData.writing.themes.join(", ")}</div>
            <div className="text-gray-500 text-xs">influences: {epkData.writing.influences.join(", ")}</div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="text-pink-400 text-sm mb-3">contact.txt</h2>
          <div className="border-l border-gray-700 pl-4 text-sm space-y-1">
            <div>email: <a href={`mailto:${epkData.contact.email}`} className="text-pink-400 hover:text-pink-300">{epkData.contact.email}</a></div>
            <div>web: <a href={epkData.contact.website} className="text-pink-400 hover:text-pink-300">messier-systems.vercel.app</a></div>
            <div>discord: {epkData.contact.socials.discord}</div>
            <div className="mt-2 space-x-3 text-xs">
              {Object.entries(epkData.contact.socials).filter(([k]) => k !== "discord").map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400">{name}</a>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-700 pt-6 flex justify-between items-center no-print">
          <Link href="/" className="text-pink-400 hover:text-pink-300 text-xs">← back to messier.exe</Link>
          <button
            onClick={() => window.print()}
            className="text-gray-500 hover:text-pink-400 text-xs border border-gray-700 px-3 py-1 hover:border-pink-400/50 transition-colors"
          >
            download as pdf
          </button>
        </div>
      </div>
    </div>
  )
}
