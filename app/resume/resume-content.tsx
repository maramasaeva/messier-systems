"use client"

import { epkData } from "../../data/epk"

export default function ResumeContent() {
  return (
    <div className="bg-white text-black font-mono min-h-screen">
      <style jsx global>{`
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; overflow: visible !important; }
          .no-print { display: none !important; }
          .resume-page { padding: 0 !important; margin: 0 !important; max-width: 100% !important; width: 100% !important; overflow: visible !important; }
          @page { margin: 0.35in 0.45in; size: letter; }
        }
        @media screen {
          .resume-page { max-width: 750px; margin: 0 auto; padding: 40px 50px; }
        }
      `}</style>

      <div className="resume-page text-[9pt] leading-[1.4]">
        {/* Header */}
        <div className="text-center border-b border-black pb-2 mb-3">
          <h1 className="text-[16pt] font-bold mb-0.5">mara masaeva</h1>
          <div className="text-[8pt] text-gray-600">
            {epkData.bio.pronouns} · {epkData.bio.location} · {epkData.contact.email} · messier-systems.vercel.app · github.com/maramasaeva · linkedin.com/in/maramasaeva
          </div>
        </div>

        {/* Summary */}
        <div className="mb-3">
          <div className="text-[8.5pt] leading-[1.35]">
            creative ai engineer with 3+ years of experience building production systems at scale. full-stack, end-to-end ownership: from backend pipelines and agentic architectures to user-facing interfaces. driven by high-impact collaboration with research teams and solving novel, ambiguous problems. deeply motivated by building systems that enhance model safety, reliability, and usefulness, and by shaping how ai systems learn from human preferences and reflect a broad range of human values. also an electronic music producer (messier) and writer (messinecessity on substack).
          </div>
        </div>

        {/* Experience */}
        <div className="mb-3">
          <h2 className="text-[10pt] font-bold border-b border-gray-400 mb-1.5 pb-0.5">experience</h2>
          <div className="space-y-2">
            {epkData.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold">{exp.role}</span>
                    <span className="text-gray-600"> @ {exp.company}</span>
                  </div>
                  <div className="text-[7.5pt] text-gray-500 whitespace-nowrap ml-4">{exp.period}</div>
                </div>
                <div className="space-y-0 ml-2">
                  {exp.highlights.map((h, j) => (
                    <div key={j} className="text-[8pt] leading-[1.3] text-gray-700">· {h}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-3">
          <h2 className="text-[10pt] font-bold border-b border-gray-400 mb-1.5 pb-0.5">education</h2>
          <div className="space-y-0.5">
            {epkData.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-baseline text-[8.5pt]">
                <div>
                  <span className="font-bold">{edu.degree}</span>
                  {edu.focus && <span className="text-gray-600">, {edu.focus}</span>}
                  <span className="text-gray-500"> · {edu.institution}</span>
                </div>
                <div className="text-[7.5pt] text-gray-500 whitespace-nowrap ml-4">{edu.period}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-3">
          <h2 className="text-[10pt] font-bold border-b border-gray-400 mb-1.5 pb-0.5">skills</h2>
          <div className="space-y-0.5 text-[8pt]">
            <div><span className="font-bold">core:</span> {epkData.skills.core.join(", ")}</div>
            <div><span className="font-bold">programming:</span> {epkData.skills.languages.join(", ")}</div>
            <div><span className="font-bold">frameworks:</span> {epkData.skills.frameworks.join(", ")}</div>
            <div><span className="font-bold">infrastructure:</span> {epkData.skills.infrastructure.join(", ")}</div>
            <div><span className="font-bold">tools:</span> {epkData.skills.tools.join(", ")}</div>
            <div><span className="font-bold">languages:</span> {epkData.skills.humanLanguages.join(", ")}</div>
          </div>
        </div>

        {/* Projects */}
        <div className="mb-3">
          <h2 className="text-[10pt] font-bold border-b border-gray-400 mb-1.5 pb-0.5">projects</h2>
          <div className="space-y-1">
            {epkData.tech.map((t, i) => (
              <div key={i}>
                <span className="font-bold text-[8.5pt]">{t.project}</span>
                {t.role && <span className="text-gray-600 text-[8pt]"> · {t.role}</span>}
                <span className="text-[8pt] text-gray-600"> · {t.description}</span>
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
