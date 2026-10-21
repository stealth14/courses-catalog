"use client";

import { MarkerType, type Edge, type Node } from "@xyflow/react";
import { DiagramCanvas, edgeStyle } from "./diagram-shared";

/** Fixed-width positions keep the over-simplified layout stable while dragging. */
const initialNodes: Node[] = [
  {
    id: "host",
    type: "card",
    position: { x: 0, y: 200 },
    style: { width: 220 },
    data: {
      title: "Computer / phone",
      detail: "Trezor Suite builds and broadcasts",
      tone: "amber",
    },
  },
  {
    id: "trezor-safe-5",
    type: "boundary",
    position: { x: 320, y: 0 },
    style: { width: 640, height: 440 },
    draggable: false,
    selectable: false,
    data: {
      title: "Trezor Safe 5",
      caption: "device internals, over-simplified",
    },
  },
  {
    id: "screen",
    type: "card",
    parentId: "trezor-safe-5",
    extent: "parent",
    position: { x: 40, y: 60 },
    style: { width: 220 },
    data: {
      title: "Touchscreen + haptics",
      detail: "you confirm every payout here",
      tone: "neutral",
    },
  },
  {
    id: "mcu",
    type: "card",
    parentId: "trezor-safe-5",
    extent: "parent",
    position: { x: 40, y: 200 },
    style: { width: 240 },
    data: {
      title: "Microcontroller",
      detail: "runs the firmware, has no plain seed",
      tone: "neutral",
    },
  },
  {
    id: "secure-element",
    type: "card",
    parentId: "trezor-safe-5",
    extent: "parent",
    position: { x: 360, y: 60 },
    style: { width: 240 },
    data: {
      title: "Secure element",
      detail: "guards the PIN, holds the device key",
      tone: "emerald",
    },
  },
  {
    id: "firmware",
    type: "card",
    parentId: "trezor-safe-5",
    extent: "parent",
    position: { x: 360, y: 200 },
    style: { width: 240 },
    data: {
      title: "Firmware",
      detail: "open source, signed by Trezor",
      tone: "violet",
    },
  },
  {
    id: "seed",
    type: "card",
    parentId: "trezor-safe-5",
    extent: "parent",
    position: { x: 360, y: 320 },
    style: { width: 240 },
    data: {
      title: "Encrypted seed",
      detail: "never leaves the device",
      tone: "sky",
    },
  },
];

/**
 * Edges carry the stroke on their arrowheads too, so the markers stay the same
 * weight as the line.
 */
function createEdges(): Edge[] {
  const style = edgeStyle();
  const marker = {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: style.stroke,
  } as const;

  return [
    {
      id: "host-to-mcu",
      source: "host",
      target: "mcu",
      sourceHandle: "out-right",
      targetHandle: "in-left",
      type: "smoothstep",
      label: "USB-C · tx ⇄ signature",
      style,
      markerStart: marker,
      markerEnd: marker,
    },
    {
      id: "screen-to-mcu",
      source: "screen",
      target: "mcu",
      sourceHandle: "out-bottom",
      targetHandle: "in-top",
      type: "smoothstep",
      label: "approve",
      style,
      markerEnd: marker,
    },
    {
      id: "mcu-to-firmware",
      source: "mcu",
      target: "firmware",
      sourceHandle: "out-right",
      targetHandle: "in-left",
      type: "smoothstep",
      label: "runs",
      style,
      markerEnd: marker,
    },
    {
      id: "secure-element-to-firmware",
      source: "secure-element",
      target: "firmware",
      sourceHandle: "out-bottom",
      targetHandle: "in-top",
      type: "smoothstep",
      label: "firmware signature",
      style,
      markerEnd: marker,
    },
    {
      id: "mcu-to-seed",
      source: "mcu",
      target: "seed",
      sourceHandle: "out-right",
      targetHandle: "in-left",
      type: "smoothstep",
      label: "encrypted seed",
      style,
      markerEnd: marker,
    },
  ];
}

/**
 * Prototype architecture sketch: a host builds a transaction, the device shows
 * it, the firmware signs it once the secure element has checked the image, and
 * only the signature travels back. Drawn with React Flow so the boxes stay
 * draggable while iterating.
 */
export function TrezorDiagram() {
  return (
    <figure className="flex flex-col gap-3">
      <DiagramCanvas nodes={initialNodes} createEdges={createEdges} />
      <figcaption className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        Over-simplified architecture of the Trezor Safe 5: the firmware only
        runs after the secure element checks its signature, the host app never
        touches the seed, and only a signature goes back. Drag the boxes around
        to rearrange the sketch.
      </figcaption>
    </figure>
  );
}
