import React from "react";
import { FileText } from "lucide-react";

interface JobDescriptionProps {
  description: string;
}

export default function JobDescription({
  description,
}: JobDescriptionProps) {
  const descriptionText = description || "";

  // Detect actual HTML tags.
  const hasHtml = /<([a-z][\s\S]*?)>/i.test(descriptionText);

  const renderMarkdownText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <strong
            key={index}
            className="font-bold text-white"
          >
            {part}
          </strong>
        );
      }

      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const renderPlainText = () => {
    const lines = descriptionText.split(/\n+/);

    return (
      <div className="space-y-4">
        {lines.map((line, index) => {
          const trimmed = line.trim();

          if (!trimmed) {
            return null;
          }

          // Markdown headings
          if (trimmed.startsWith("###")) {
            return (
              <div key={index} className="pt-5 first:pt-0">
                <h3
                  className="
                    text-sm
                    font-black
                    text-white
                    uppercase
                    tracking-wide
                    flex items-center gap-3
                  "
                >
                  <span className="w-1 h-4 rounded-full bg-emerald-400" />
                  {trimmed.replace(/^###\s*/, "")}
                </h3>
              </div>
            );
          }

          // Markdown bullets
          if (/^[*-]\s+/.test(trimmed)) {
            const cleanItem = trimmed.replace(/^[*-]\s+/, "");

            return (
              <div
                key={index}
                className="flex items-start gap-3"
              >
                <span
                  className="
                    mt-2
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-emerald-400
                    shrink-0
                  "
                />

                <p
                  className="
                    text-[14px]
                    leading-7
                    text-slate-300
                  "
                >
                  {renderMarkdownText(cleanItem)}
                </p>
              </div>
            );
          }

          // Normal paragraph
          return (
            <p
              key={index}
              className="
                text-[14px]
                sm:text-[15px]
                leading-7
                text-slate-300
                font-normal
              "
            >
              {renderMarkdownText(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="
        lg:col-span-2
        bg-slate-900/70
        backdrop-blur-2xl
        rounded-3xl
        border border-slate-800/90
        shadow-2xl
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="p-6 sm:p-7 border-b border-slate-800/80">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="
                p-2.5
                bg-emerald-500/10
                border border-emerald-500/20
                rounded-xl
                text-emerald-400
                shrink-0
              "
            >
              <FileText size={18} />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Job Description
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Role overview, responsibilities & requirements
              </p>
            </div>
          </div>

          <span
            className="
              hidden sm:inline-flex
              shrink-0
              px-3 py-1.5
              bg-slate-800/80
              border border-slate-700/70
              rounded-xl
              text-[10px]
              font-black
              uppercase
              tracking-widest
              text-slate-400
            "
          >
            Full Overview
          </span>
        </div>
      </div>

      {/* Description */}
      <article
        className="
          p-6 sm:p-7
          prose prose-invert max-w-none
        "
      >
        {hasHtml ? (
          <div
            className="
              text-slate-300
              text-[14px]
              sm:text-[15px]
              leading-7

              prose-p:text-slate-300
              prose-p:leading-7
              prose-p:my-4

              prose-headings:text-white
              prose-headings:font-black

              prose-h2:text-lg
              prose-h3:text-sm
              prose-h3:uppercase
              prose-h3:tracking-wide

              prose-strong:text-white
              prose-strong:font-bold

              prose-ul:list-disc
              prose-ul:pl-6

              prose-ol:list-decimal
              prose-ol:pl-6

              prose-li:text-slate-300
              prose-li:my-1.5

              prose-a:text-emerald-400
              prose-a:no-underline
              hover:prose-a:text-emerald-300
            "
            dangerouslySetInnerHTML={{
              __html: descriptionText,
            }}
          />
        ) : (
          renderPlainText()
        )}
      </article>
    </div>
  );
}