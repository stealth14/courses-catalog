"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Timeline from "./charts/timeline/Timeline";
import type { ContentBlocks } from "@/models/post";

const BODY = "text-base leading-7 text-zinc-600 dark:text-zinc-400";
const HEADING =
  "text-xl font-semibold tracking-tight text-black dark:text-zinc-50";

/**
 * A chart placeholder occupying a whole row of the Markdown body, e.g.
 * `[timeline/trezor_incidents]` renders the timeline stored in
 * `blocks.trezor_incidents`.
 */
const CHART_TOKEN = /^\[([a-z][\w-]*)\/([\w.-]+)\]$/;

type MarkdownSegment =
  | { type: "markdown"; content: string }
  | { type: "chart"; chartType: string; blockKey: string };

/** Splits the body into Markdown chunks and the chart tokens between them. */
function splitChartTokens(markdown: string): MarkdownSegment[] {
  const segments: MarkdownSegment[] = [];
  let chunk: string[] = [];

  const flush = () => {
    const content = chunk.join("\n");
    if (content.trim()) segments.push({ type: "markdown", content });
    chunk = [];
  };

  for (const line of markdown.split(/\r?\n/)) {
    const token = CHART_TOKEN.exec(line.trim());

    if (!token) {
      chunk.push(line);
      continue;
    }

    flush();
    segments.push({ type: "chart", chartType: token[1], blockKey: token[2] });
  }

  flush();
  return segments;
}

/**
 * Strapi v5 `markdown` fields are plain Markdown strings, so they are
 * rendered with `react-markdown` (+ GFM support for the tables, task lists
 * and strikethrough its editor produces). Raw HTML is ignored, which keeps
 * sanitization on by default.
 */
const COMPONENTS: Components = {
  h1: ({ children }) => <h2 className={HEADING}>{children}</h2>,
  h2: ({ children }) => <h2 className={HEADING}>{children}</h2>,
  h3: ({ children }) => <h3 className={HEADING}>{children}</h3>,
  h4: ({ children }) => <h4 className={HEADING}>{children}</h4>,
  p: ({ children }) => <p className={BODY}>{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary-deep underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:text-primary-soft dark:decoration-white/25"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className={`${BODY} list-disc space-y-1 pl-5`}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className={`${BODY} list-decimal space-y-1 pl-5`}>{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-black dark:text-zinc-50">
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote
      className={`border-l-2 border-primary-deep/40 pl-4 ${BODY} dark:border-primary-soft/40`}
    >
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] text-black dark:bg-white/[.1] dark:text-zinc-50">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-xl bg-black/[.06] p-4 font-mono text-sm leading-6 text-black [&>code]:bg-transparent [&>code]:p-0 dark:bg-white/[.08] dark:text-zinc-50">
      {children}
    </pre>
  ),
  hr: () => <hr className="border-black/[.12] dark:border-white/[.16]" />,
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-black/[.12] px-3 py-2 font-semibold text-black dark:border-white/[.16] dark:text-zinc-50">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-black/[.08] px-3 py-2 dark:border-white/[.1]">
      {children}
    </td>
  ),
};

/** Renders a chart block, or nothing when the referenced block is missing. */
function ChartBlock({
  chartType,
  blockKey,
  blocks,
}: {
  chartType: string;
  blockKey: string;
  blocks: ContentBlocks | undefined;
}) {
  const config = blocks?.[blockKey];

  if (!config) return null;

  if (chartType === "timeline" && Array.isArray(config.events)) {
    return <Timeline config={config} />;
  }

  return null;
}

/**
 * Renders the Markdown body of a post, replacing `[timeline/<key>]` rows with
 * the matching chart from `blocks`; empty bodies render nothing.
 */
export function PostMarkdown({
  markdown,
  blocks,
}: {
  markdown: string | null | undefined;
  blocks?: ContentBlocks;
}) {
  if (!markdown?.trim()) return null;

  return (
    <div className="flex flex-col gap-4">
      {splitChartTokens(markdown).map((segment, index) =>
        segment.type === "markdown" ? (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm]}
            components={COMPONENTS}
          >
            {segment.content}
          </ReactMarkdown>
        ) : (
          <ChartBlock
            key={index}
            chartType={segment.chartType}
            blockKey={segment.blockKey}
            blocks={blocks}
          />
        )
      )}
    </div>
  );
}
