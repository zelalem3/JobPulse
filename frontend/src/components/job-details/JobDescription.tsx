import React from "react";

interface JobDescriptionProps {
  description: string;
}

export default function JobDescription({ description }: JobDescriptionProps) {
  const descriptionText = description || "";
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(descriptionText);

  return (
    <div className="lg:col-span-2 bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
          Job Description & Requirements
        </h2>
        <span className="text-[11px] font-semibold px-2.5 py-1 bg-slate-800/80 rounded-xl text-slate-400">
          Full Overview
        </span>
      </div>

      <article className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
        {hasHtml ? (
          <div
            className="space-y-4 text-slate-300 prose-p:text-slate-300 prose-p:font-normal prose-p:text-[14px] prose-p:leading-relaxed prose-headings:text-white prose-headings:font-bold prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-li:text-slate-300"
            dangerouslySetInnerHTML={{ __html: descriptionText }}
          />
        ) : (
          <div className="space-y-4 text-slate-300">
            {descriptionText.split(/\n+/).map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith("###")) {
                return (
                  <h3
                    key={index}
                    className="text-base font-bold text-white pt-4 pb-2 border-b border-slate-800/60 mt-6 first:mt-0"
                  >
                    {trimmed.replace("###", "").trim()}
                  </h3>
                );
              }

              if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
                const cleanLi = trimmed.replace(/^[*-\s]+/, "").trim();
                return (
                  <ul key={index} className="list-disc pl-5 my-1.5 space-y-1">
                    <li className="text-slate-300 text-[14px] font-normal leading-relaxed">
                      {cleanLi.split("**").map((chunk, cIdx) =>
                        cIdx % 2 === 1 ? (
                          <strong key={cIdx} className="text-white font-bold">
                            {chunk}
                          </strong>
                        ) : (
                          chunk
                        )
                      )}
                    </li>
                  </ul>
                );
              }

              return (
                <p
                  key={index}
                  className="text-slate-300 text-[14px] leading-relaxed font-normal"
                >
                  {trimmed}
                </p>
              );
            })}
          </div>
        )}
      </article>
    </div>
  );
}