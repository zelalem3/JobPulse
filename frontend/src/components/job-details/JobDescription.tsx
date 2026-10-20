
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeRaw from "rehype-raw";
import { FileText } from "lucide-react";

interface JobDescriptionProps {
  description: string;
}

export default function JobDescription({
  description,
}: JobDescriptionProps) {
  const descriptionText = description?.trim() || "";

  // Detect HTML tags without confusing ordinary text for HTML.
  const hasHtml = /<\/?[a-z][^>]*>/i.test(descriptionText);

  // Convert HTML line breaks and block endings into readable Markdown
  // before parsing. HTML is sanitized after parsing.
  const content = hasHtml
    ? descriptionText
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|h[1-6]|li|section)>/gi, "\n\n")
    : descriptionText;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-xl shadow-black/10">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-slate-800/80 px-5 py-5 sm:px-7">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
          <FileText size={19} />
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
            Job description
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Responsibilities, qualifications and role details
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="px-5 py-6 sm:px-7 sm:py-8">
        {descriptionText ? (
          <div
            className="
              job-description
              max-w-3xl
              text-[15px] leading-7 text-slate-300

              [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-xl
              [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-white
              [&_h1:first-child]:mt-0

              [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:border-b
              [&_h2]:border-slate-800 [&_h2]:pb-2
              [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white
              [&_h2:first-child]:mt-0

              [&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-base
              [&_h3]:font-semibold [&_h3]:text-emerald-300
              [&_h3:first-child]:mt-0

              [&_p]:mb-4 [&_p]:leading-7
              [&_p:last-child]:mb-0

              [&_strong]:font-semibold [&_strong]:text-slate-100

              [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2
              [&_ul]:pl-6

              [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-2
              [&_ol]:pl-6

              [&_li]:pl-1 [&_li]:leading-7
              [&_li::marker]:text-emerald-400

              [&_a]:text-emerald-400 [&_a]:underline
              [&_a]:underline-offset-4
              [&_a:hover]:text-emerald-300

              [&_blockquote]:my-5 [&_blockquote]:border-l-2
              [&_blockquote]:border-emerald-500/50
              [&_blockquote]:pl-4 [&_blockquote]:text-slate-400

              [&_hr]:my-7 [&_hr]:border-slate-800

              [&_code]:rounded [&_code]:bg-slate-800
              [&_code]:px-1.5 [&_code]:py-0.5
              [&_code]:text-emerald-300 [&_code]:text-sm

              [&_table]:my-5 [&_table]:w-full
              [&_table]:border-collapse [&_table]:text-sm
              [&_th]:border [&_th]:border-slate-700
              [&_th]:bg-slate-800 [&_th]:p-3 [&_th]:text-left
              [&_th]:font-semibold [&_th]:text-slate-100
              [&_td]:border [&_td]:border-slate-800
              [&_td]:p-3
            "
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={
                hasHtml
                  ? [rehypeRaw, rehypeSanitize]
                  : []
              }
              components={{
                a: ({ href, children, ...props }) => {
                  const safeHref =
                    href &&
                    /^(https?:|mailto:|\/|#)/i.test(href) &&
                    !/^\/\//.test(href)
                      ? href
                      : undefined;

                  return (
                    <a
                      {...props}
                      href={safeHref}
                      target={
                        safeHref?.startsWith("http")
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        safeHref?.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/30 px-5 py-10 text-center">
            <FileText
              size={24}
              className="mx-auto text-slate-600"
            />
            <p className="mt-3 text-sm font-medium text-slate-300">
              No job description available
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Check the original listing for more information.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
