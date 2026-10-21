"use client";

import type { Edge, Node } from "@xyflow/react";
import { DiagramCanvas, edgeStyle } from "./diagram-shared";

/** Groups of use cases, in the order a holder meets them. */
const USE_CASE_GROUPS = [
  {
    id: "group-setup",
    cases: ["case-new", "case-recover", "case-pin"],
  },
  {
    id: "group-everyday",
    cases: ["case-pay", "case-receive", "case-passphrase"],
  },
  {
    id: "group-upkeep",
    cases: ["case-update", "case-verify", "case-wipe"],
  },
];

const initialNodes: Node[] = [
  {
    id: "you",
    type: "card",
    position: { x: 390, y: 0 },
    style: { width: 220 },
    data: {
      title: "You",
      detail: "every action is approved on the device",
      tone: "amber",
    },
  },
  {
    id: "boundary",
    type: "boundary",
    position: { x: 60, y: 130 },
    style: { width: 880, height: 400 },
    draggable: false,
    selectable: false,
    data: {
      title: "Trezor Safe 5 + Trezor Suite",
      caption: "the device and the app it talks to",
    },
  },
  {
    id: "group-setup",
    type: "card",
    parentId: "boundary",
    extent: "parent",
    position: { x: 40, y: 50 },
    style: { width: 220 },
    data: { title: "Set up", variant: "pill" },
  },
  {
    id: "case-new",
    type: "card",
    parentId: "boundary",
    extent: "parent",
    position: { x: 40, y: 120 },
    style: { width: 220 },
    data: {
      title: "Create a new wallet",
      detail: "20-word backup, written on paper",
      tone: "neutral",
    },
  },
  {
    id: "case-recover",
    type: "card",
    parentId: "boundary",
    extent: "parent",
    position: { x: 40, y: 210 },
    style: { width: 220 },
    data: {
      title: "Recover from a backup",
      detail: "type the words on the device",
      tone: "neutral",
    },
  },
  {
    id: "case-pin",
    type: "card",
    parentId: "boundary",
    extent: "parent",
    position: { x: 40, y: 300 },
    style: { width: 220 },
    data: {
      title: "Set a PIN",
      detail: "asked every time it wakes up",
      tone: "neutral",
    },
  },
  {
    id: "group-everyday",
    type: "card",
    parentId: "boundary",
    extent: "parent",
    position: { x: 330, y: 50 },
    style: { width: 220 },
    data: { title: "Everyday use", variant: "pill" },
  },
  {
    id: "case-pay",
    type: "card",
    parentId: "boundary",
    extent: "parent",
    position: { x: 330, y: 120 },
    style: { width: 220 },
    data: {
      title: "Sign a payment",
      detail: "check address and fee on screen",
      tone: "neutral",
    },
  },
  {
    id: "case-receive",
    type: "card",
    parentId: "boundary",
    extent: "parent",
    position: { x: 330, y: 210 },
    style: { width: 220 },
    data: {
      title: "Share a receive address",
      detail: "confirm it on the display",
      tone: "neutral",
    },
  },
  {
    id: "case-passphrase",
    type: "card",
    parentId: "boundary",
    extent: "parent",
    position: { x: 330, y: 300 },
    style: { width: 220 },
    data: {
      title: "Unlock with a passphrase",
      detail: "one hidden wallet per passphrase",
      tone: "neutral",
    },
  },
  {
    id: "group-upkeep",
    type: "card",
    parentId: "boundary",
    extent: "parent",
    position: { x: 620, y: 50 },
    style: { width: 220 },
    data: { title: "Upkeep", variant: "pill" },
  },
  {
    id: "case-update",
    type: "card",
    parentId: "boundary",
    extent: "parent",
    position: { x: 620, y: 120 },
    style: { width: 220 },
    data: {
      title: "Update the firmware",
      detail: "signed by Trezor, checked on device",
      tone: "neutral",
    },
  },
  {
    id: "case-verify",
    type: "card",
    parentId: "boundary",
    extent: "parent",
    position: { x: 620, y: 210 },
    style: { width: 220 },
    data: {
      title: "Verify the device",
      detail: "Suite checks the firmware signature",
      tone: "neutral",
    },
  },
  {
    id: "case-wipe",
    type: "card",
    parentId: "boundary",
    extent: "parent",
    position: { x: 620, y: 300 },
    style: { width: 220 },
    data: {
      title: "Wipe before selling",
      detail: "factory reset drops the seed",
      tone: "neutral",
    },
  },
];

/**
 * Actor-to-use-case associations, the way a use-case diagram draws them:
 * plain lines, no arrowheads.
 */
function createEdges(): Edge[] {
  const style = edgeStyle();

  return [
    ...USE_CASE_GROUPS.map(({ id }) => ({
      id: `you-${id}`,
      source: "you",
      target: id,
    })),
    ...USE_CASE_GROUPS.flatMap(({ id, cases }) =>
      cases.map((caseId) => ({
        id: `${id}-${caseId}`,
        source: id,
        target: caseId,
      }))
    ),
  ].map((edge) => ({
    ...edge,
    sourceHandle: "out-bottom",
    targetHandle: "in-top",
    type: "smoothstep",
    style,
  }));
}

/**
 * Use-case map: who acts on the device, and everything that actor can
 * actually do with it, grouped by the moment it happens.
 */
export function TrezorUseCases() {
  return (
    <figure className="flex flex-col gap-3">
      <DiagramCanvas
        nodes={initialNodes}
        createEdges={createEdges}
        heightClassName="h-[480px]"
      />
      <figcaption className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        How you actually meet the Trezor Safe 5: set it up once, use it every
        day, keep it current. Nothing on this map happens without you approving
        it on the device.
      </figcaption>
    </figure>
  );
}
