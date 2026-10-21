/**
 * Color pairs shared by diagram nodes and the page legends. The canvases are
 * always light, so these intentionally have no dark variants.
 */
export type DiagramTone = "amber" | "neutral" | "emerald" | "sky" | "violet";

export const DIAGRAM_TONE_STYLES: Record<DiagramTone, string> = {
  amber: "border-amber-600/30 bg-amber-50",
  neutral: "border-black/[.10] bg-white",
  emerald: "border-emerald-600/30 bg-emerald-50",
  sky: "border-sky-600/30 bg-sky-50",
  violet: "border-violet-600/30 bg-violet-50",
};
