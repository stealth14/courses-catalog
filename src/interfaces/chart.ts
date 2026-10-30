import type { TimelineConfig } from "@/components/charts/timeline/Timeline";

/** Chart types supported by the Markdown `[<type>/<blockKey>]` token. */
export type ChartType = "timeline";

/** Payload shape for each supported chart type, keyed by `ChartType`. */
export type ChartPayloads = {
  timeline: TimelineConfig;
};

/**
 * Payload of a `timeline` block. Referenced from Markdown with the
 * `[timeline/<blockKey>]` token and read from `PostContent.blocks[<blockKey>]`.
 */
export type TimelineChart = ChartPayloads["timeline"];

/** Union of every chart block payload a post can embed. */
export type PostChart = ChartPayloads[ChartType];