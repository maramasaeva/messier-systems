"use client"

import { epkData } from "../../data/epk"

export default function ResumeContent() {
  return (
    <div className="bg-white text-black font-mono min-h-screen">
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          @page { margin: 0.4in 0.5in; size: letter; }
        }
        @media screen {
          .resume-page { max-width: 800px; margin: 0 auto; padding: 40px; }
        }
      `}</style>

      <div className="resume-page text-[10pt] leading-[1.45]">
        {/* Header */}
        <div className="text-center border-b border-black pb-3 mb-4">
          <h1 className="text-[20pt] font-bold mb-1">mara masaeva</h1>
          <div className="text-[9pt] text-gray-600">
            {epkData.bio.pronouns} · {epkData.bio.location} · {epkData.contact.email} · messier-systems.vercel.app · github.com/maramasaeva · linkedin.com/in/maramasaeva
          </div>
        </div>

        {/* Summary */}
        <div className="mb-4">
          <div className="text-[9pt] leading-[1.4]">
            {epkData.bio.description}
          </div>
        </div>

        {/* Experience */}
        <div className="mb-4">
          <h2 className="text-[11pt] font-bold border-b border-gray-400 mb-2 pb-0.5">experience</h2>
          <div className="space-y-3">
            {epkData.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold">{exp.role}</span>
                    <span className="text-gray-600"> @ {exp.company}</span>
                  </div>
                  <div className="text-[8pt] text-gray-500 whitespace-nowrap ml-4">{exp.period}</div>
                </div>
                <div className="text-[8pt] text-gray-500 mb-1">{exp.location}</div>
                <div className="space-y-0.5 ml-2">
                  {exp.highlights.map((h, j) => (
                    <div key={j} className="text-[9pt] leading-[1.35]">· {h}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-4">
          <h2 className="text-[11pt] font-bold border-b border-gray-400 mb-2 pb-0.5">education</h2>
          <div className="space-y-1.5">
            {epkData.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold">{edu.degree}</span>
                  {edu.focus && <span className="text-gray-600">, {edu.focus}</span>}
                  <span className="text-gray-500"> · {edu.institution}</span>
                </div>
                <div className="text-[8pt] text-gray-500 whitespace-nowrap ml-4">{edu.period}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <h2 className="text-[11pt] font-bold border-b border-gray-400 mb-2 pb-0.5">skills</h2>
          <div className="space-y-1 text-[9pt]">
            <div><span className="font-bold">core:</span> {epkData.skills.core.join(", ")}</div>
            <div><span className="font-bold">programming:</span> {epkData.skills.languages.join(", ")}</div>
            <div><span className="font-bold">frameworks:</span> {epkData.skills.frameworks.join(", ")}</div>
            <div><span className="font-bold">infrastructure:</span> {epkData.skills.infrastructure.join(", ")}</div>
            <div><span className="font-bold">tools:</span> {epkData.skills.tools.join(", ")}</div>
            <div><span className="font-bold">languages:</span> {epkData.skills.humanLanguages.join(", ")}</div>
          </div>
        </div>

        {/* Projects */}
        <div className="mb-4">
          <h2 className="text-[11pt] font-bold border-b border-gray-400 mb-2 pb-0.5">projects</h2>
          <div className="space-y-2">
            {epkData.tech.map((t, i) => (
              <div key={i}>
                <div>
                  <span className="font-bold">{t.project}</span>
                  {t.role && <span className="text-gray-600"> · {t.role}</span>}
                </div>
                <div className="text-[9pt] text-gray-600 leading-[1.35]">{t.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Print button */}
        <div className="no-print mt-8 pt-4 border-t border-gray-200 flex justify-between items-center">
          <a href="/epk" className="text-gray-500 hover:text-black text-[9pt]">← back to full epk</a>
          <button
            onClick={() => window.print()}
            className="text-[9pt] border border-gray-400 px-3 py-1 hover:bg-gray-100"
          >
            download as pdf
          </button>
        </div>
      </div>
    </div>
  )
}
