"use client";

import { useMemo, type ReactNode } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import { DIAGRAM_TONE_STYLES, type DiagramTone } from "./diagram-tones";
import "@xyflow/react/dist/style.css";

export type DiagramCardData = {
  title: string;
  detail?: string;
  /** Ignored by the `pill` variant, which has its own muted look. */
  tone?: DiagramTone;
  /** `pill` renders a group heading instead of a full card. */
  variant?: "pill";
};

export type DiagramCardNode = Node<DiagramCardData, "card">;

export type DiagramBoundaryData = { title: string; caption: string };
export type DiagramBoundaryNode = Node<DiagramBoundaryData, "boundary">;

export type DiagramIconCardData = {
  title: string;
  icon: ReactNode;
  tone?: DiagramTone;
};

export type DiagramIconCardNode = Node<DiagramIconCardData, "icon-card">;

/** Every canvas is light, so edges keep one stroke color regardless of theme. */
export const EDGE_STROKE = "#a1a1aa";

export function edgeStyle() {
  return { stroke: EDGE_STROKE, strokeWidth: 1.5 };
}

/**
 * All four handles exist on every node so an edge can leave or enter from any
 * side; they are transparent because these diagrams are read, not wired up.
 */
function DiagramHandles() {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        id="in-left"
        className="opacity-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out-right"
        className="opacity-0"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="in-top"
        className="opacity-0"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="out-top"
        className="opacity-0"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="in-bottom"
        className="opacity-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="out-bottom"
        className="opacity-0"
      />
    </>
  );
}

function CardNode({ data }: NodeProps<DiagramCardNode>) {
  if (data.variant === "pill") {
    return (
      <div className="w-full rounded-full border border-black/[.08] bg-zinc-100 px-3 py-2 text-center shadow-sm">
        <p className="text-xs font-semibold tracking-tight text-zinc-700">
          {data.title}
        </p>
        <DiagramHandles />
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-2xl border px-4 py-3 text-left shadow-sm ${DIAGRAM_TONE_STYLES[data.tone ?? "neutral"]}`}
    >
      <p className="text-sm font-semibold tracking-tight text-black">
        {data.title}
      </p>
      {data.detail && (
        <p className="mt-1 text-[11px] leading-4 text-zinc-600">
          {data.detail}
        </p>
      )}
      <DiagramHandles />
    </div>
  );
}

function BoundaryNode({ data }: NodeProps<DiagramBoundaryNode>) {
  return (
    <div className="h-full w-full rounded-3xl border border-dashed border-black/[.16] bg-zinc-50 px-4 py-3">
      <p className="text-xs font-semibold tracking-tight text-black">
        {data.title}
      </p>
      <p className="mt-0.5 text-[11px] leading-4 text-zinc-500">
        {data.caption}
      </p>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  card: CardNode,
  boundary: BoundaryNode,
};

/**
 * Shared canvas chrome for the prototype diagrams: dot grid, zoom controls and
 * a light surface. `color-scheme: light` keeps the browser's own chrome inside
 * the canvas light too, so the drawing stays readable on a dark page.
 */
export function DiagramCanvas({
  nodes,
  createEdges,
  heightClassName = "h-[440px]",
}: {
  nodes: Node[];
  createEdges: () => Edge[];
  heightClassName?: string;
}) {
  const edges = useMemo(() => createEdges(), [createEdges]);

  return (
    <div
      className={`${heightClassName} w-full overflow-hidden rounded-2xl border border-black/[.08] bg-white text-zinc-900 [color-scheme:light]`}
    >
      <ReactFlow
        defaultNodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        colorMode="light"
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.4}
        maxZoom={1.5}
        nodesConnectable={false}
        edgesFocusable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
