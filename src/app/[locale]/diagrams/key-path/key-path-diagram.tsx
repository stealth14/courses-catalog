"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  DatabaseIcon,
  DisplayIcon,
  FirmwareChipIcon,
  GlobeIcon,
  KeyIcon,
  LaptopIcon,
  ShieldIcon,
  UsbIcon,
  type FirmwareIconProps,
} from "@/components/icons/firmware-icons";

type StepId =
  | "network"
  | "suite"
  | "usb"
  | "firmware"
  | "screen"
  | "secure-elements"
  | "flash"
  | "signing";

type Step = {
  id: StepId;
  hardware: string;
  software: string;
  action: string;
  touchesKeys: boolean;
  icon: ComponentType<FirmwareIconProps>;
};

/**
 * The journey of a bitcoin send through a Trezor Safe 7, in reading order:
 * the network sits next to the host because only Trezor Suite reaches it.
 */
const STEPS: Step[] = [
  {
    id: "network",
    hardware: "Bitcoin network",
    software: "Peer protocol",
    action: "Verifies the signature and accepts the payment.",
    touchesKeys: false,
    icon: GlobeIcon,
  },
  {
    id: "suite",
    hardware: "Host computer",
    software: "Trezor Suite",
    action: "Builds the unsigned transaction from the recipient address.",
    touchesKeys: false,
    icon: LaptopIcon,
  },
  {
    id: "usb",
    hardware: "USB-C cable",
    software: "USB transport",
    action: "Carries the unsigned transaction to the device.",
    touchesKeys: false,
    icon: UsbIcon,
  },
  {
    id: "firmware",
    hardware: "Trezor Safe 7",
    software: "Trezor Core firmware",
    action: "Receives the transaction and prepares it for confirmation.",
    touchesKeys: false,
    icon: FirmwareChipIcon,
  },
  {
    id: "screen",
    hardware: '2.5" color touchscreen',
    software: "Firmware UI",
    action: "Shows recipient, amount and fee. You confirm on the device.",
    touchesKeys: false,
    icon: DisplayIcon,
  },
  {
    id: "secure-elements",
    hardware: "TROPIC01 + Optiga chips",
    software: "Secure element applets",
    action: "Release the secret that unlocks the encrypted seed.",
    touchesKeys: true,
    icon: ShieldIcon,
  },
  {
    id: "flash",
    hardware: "Flash memory",
    software: "Encrypted seed storage",
    action: "Decrypts the seed and loads the key material into working memory.",
    touchesKeys: true,
    icon: DatabaseIcon,
  },
  {
    id: "signing",
    hardware: "STM32U5 microcontroller",
    software: "BIP32 + ECDSA signing",
    action: "Derives the private key and signs the transaction.",
    touchesKeys: true,
    icon: KeyIcon,
  },
];

/** First device-internal step and last device-internal step (inclusive). */
const DEVICE_RANGE = [3, 7] as const;

/**
 * Which components talk to each other during a send. The wallet only
 * communicates with Trezor Suite over USB, and only Suite reaches the
 * Bitcoin network — so signing never connects to the network directly.
 */
const CONNECTED_PAIRS: [StepId, StepId][] = [
  ["network", "suite"],
  ["suite", "usb"],
  ["usb", "firmware"],
  ["firmware", "screen"],
  ["screen", "secure-elements"],
  ["secure-elements", "flash"],
  ["flash", "signing"],
];

/** Selectable trace speeds, in px/ms. Fast is the original pace. */
const SPEEDS = {
  fast: { label: "Fast", pxPerMs: 0.45 },
  normal: { label: "Normal", pxPerMs: 0.18 },
} as const;

type SpeedId = keyof typeof SPEEDS;

type Point = { x: number; y: number };

type CardRect = { l: number; t: number; r: number; b: number; cy: number };

type Milestone = { id: StepId; ms: number };

type Geometry = {
  cards: CardRect[];
  fullPath: string;
  railPath: string;
  totalMs: number;
  milestones: Milestone[];
  amberEndPct: number;
  goldEndPct: number;
  railY: number;
  broadcastLabel: Point;
  deviceBox: { left: number; top: number; width: number; height: number };
};

function segmentLength(from: Point, to: Point) {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

function toPath(points: Point[]) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function polyLength(points: Point[]) {
  let length = 0;
  for (let index = 1; index < points.length; index++) {
    length += segmentLength(points[index - 1], points[index]);
  }
  return length;
}

/**
 * Builds the single journey the one dot follows, plus when the dot reaches
 * each element. The dot's meaning (and colour) changes with the phase:
 * - amber: unsigned transaction, Suite -> USB -> firmware -> screen
 * - gold: private key, secure elements -> flash -> signing
 * - green: signed transaction, signing -> USB -> Suite -> network
 */
function measure(
  stage: HTMLDivElement,
  nodes: (HTMLDivElement | null)[],
  pxPerMs: number,
) {
  const stageRect = stage.getBoundingClientRect();

  const fallback: CardRect = { l: 0, t: 0, r: 0, b: 0, cy: 0 };
  const cards: CardRect[] = nodes.map((node) => {
    if (!node) return fallback;
    const rect = node.getBoundingClientRect();
    return {
      l: rect.left - stageRect.left,
      t: rect.top - stageRect.top,
      r: rect.right - stageRect.left,
      b: rect.bottom - stageRect.top,
      cy: rect.top + rect.height / 2 - stageRect.top,
    };
  });

  // Cards in reading order: 0 network, 1 suite, 2 usb, 3 firmware,
  // 4 screen, 5 secure elements, 6 flash, 7 signing.
  const rect = (index: number) => cards[index] ?? fallback;
  const wave = (index: number): Point[] => {
    const card = rect(index);
    return [
      { x: card.l, y: card.cy },
      { x: card.l, y: card.t },
      { x: card.r, y: card.t },
      { x: card.r, y: card.cy },
    ];
  };
  const connector = (from: number, to: number): Point[] => [
    { x: rect(from).r, y: rect(from).cy },
    { x: rect(to).l, y: rect(to).cy },
  ];

  // Amber phase: the unsigned transaction travels host -> device.
  const amberPoints = [
    ...wave(1),
    ...connector(1, 2),
    ...wave(2),
    ...connector(2, 3),
    ...wave(3),
    ...connector(3, 4),
    ...wave(4),
  ];

  // Gold phase: the private key moves only inside the device.
  const goldPoints = [
    ...connector(4, 5),
    ...wave(5),
    ...connector(5, 6),
    ...wave(6),
    ...connector(6, 7),
    ...wave(7),
  ];

  // Green phase: the signed transaction returns through the USB cable
  // to Trezor Suite, which broadcasts it to the network.
  const railY = stage.offsetHeight - 26;
  const greenPoints = [
    { x: rect(7).r, y: rect(7).cy },
    { x: rect(7).r, y: railY },
    { x: rect(2).r, y: railY },
    { x: rect(2).r, y: rect(2).cy },
    { x: rect(2).l, y: rect(2).cy },
    { x: rect(1).r, y: rect(1).cy },
    { x: rect(1).l, y: rect(1).cy },
    { x: rect(0).r, y: rect(0).cy },
  ];

  const railPoints = [
    { x: rect(7).r, y: rect(7).cy },
    { x: rect(7).r, y: railY },
    { x: rect(2).r, y: railY },
    { x: rect(2).r, y: rect(2).cy },
  ];

  const ms = (length: number) => Math.round(length / pxPerMs);

  const waveLength = (index: number) => polyLength(wave(index));
  const connectorLength = segmentLength(
    { x: rect(4).r, y: rect(4).cy },
    { x: rect(5).l, y: rect(5).cy },
  );

  const amberLength = polyLength(amberPoints);
  const goldLength = polyLength(goldPoints);
  const fullLength = amberLength + goldLength + polyLength(greenPoints);

  const amberMs = ms(amberLength);
  const totalMs = ms(fullLength);

  const goldStart = amberMs;
  const goldOffsetsMs = {
    secureElements: ms(connectorLength),
    flash: ms(connectorLength + waveLength(5) + connectorLength),
    signing: ms(
      connectorLength +
        waveLength(5) +
        connectorLength +
        waveLength(6) +
        connectorLength,
    ),
  };

  const milestones: Milestone[] = [
    { id: "suite", ms: 0 },
    { id: "usb", ms: ms(waveLength(1) + connectorLength) },
    {
      id: "firmware",
      ms: ms(waveLength(1) + connectorLength + waveLength(2) + connectorLength),
    },
    {
      id: "screen",
      ms: ms(
        waveLength(1) +
          connectorLength +
          waveLength(2) +
          connectorLength +
          waveLength(3) +
          connectorLength,
      ),
    },
    { id: "secure-elements", ms: goldStart + goldOffsetsMs.secureElements },
    { id: "flash", ms: goldStart + goldOffsetsMs.flash },
    { id: "signing", ms: goldStart + goldOffsetsMs.signing },
    { id: "network", ms: totalMs - ms(connectorLength) },
  ];

  const deviceNodes = nodes
    .slice(DEVICE_RANGE[0], DEVICE_RANGE[1] + 1)
    .filter((node): node is HTMLDivElement => node !== null);
  const left = Math.min(
    ...deviceNodes.map(
      (node) => node.getBoundingClientRect().left - stageRect.left,
    ),
  );
  const right = Math.max(
    ...deviceNodes.map(
      (node) => node.getBoundingClientRect().right - stageRect.left,
    ),
  );
  const top = Math.min(
    ...deviceNodes.map(
      (node) => node.getBoundingClientRect().top - stageRect.top,
    ),
  );
  const bottom = Math.max(
    ...deviceNodes.map(
      (node) => node.getBoundingClientRect().bottom - stageRect.top,
    ),
  );

  return {
    cards,
    fullPath: toPath([...amberPoints, ...goldPoints, ...greenPoints]),
    railPath: toPath(railPoints),
    totalMs,
    milestones,
    amberEndPct: Math.round((amberLength / fullLength) * 1000) / 10,
    goldEndPct:
      Math.round(((amberLength + goldLength) / fullLength) * 1000) / 10,
    railY,
    broadcastLabel: {
      x: (rect(0).r + rect(1).l) / 2,
      y: 46,
    },
    deviceBox: {
      left: left - 16,
      top: top - 30,
      width: right - left + 32,
      height: bottom - top + 44,
    },
  };
}

/**
 * One dot, three meanings. The keyframes hold the colour (and glow) of the
 * current role: amber while it is the unsigned transaction, gold while it
 * is the private key, green once it is the signed transaction. The dot
 * stays visible for the whole run.
 */
function travelKeyframes(amberEndPct: number, goldEndPct: number) {
  return `
@keyframes kp-travel {
  0% {
    offset-distance: 0%;
    background-color: rgb(245 158 11);
    box-shadow: 0 4px 10px rgb(245 158 11 / 0.45);
  }
  ${amberEndPct}% {
    background-color: rgb(245 158 11);
    box-shadow: 0 4px 10px rgb(245 158 11 / 0.45);
  }
  ${amberEndPct + 0.5}% {
    background-color: rgb(250 204 21);
    box-shadow: 0 0 0 2px rgb(254 240 138), 0 4px 10px rgb(250 204 21 / 0.55);
  }
  ${goldEndPct}% {
    background-color: rgb(250 204 21);
    box-shadow: 0 0 0 2px rgb(254 240 138), 0 4px 10px rgb(250 204 21 / 0.55);
  }
  ${goldEndPct + 0.5}% {
    background-color: rgb(16 185 129);
    box-shadow: 0 4px 10px rgb(16 185 129 / 0.5);
  }
  100% {
    offset-distance: 100%;
    background-color: rgb(16 185 129);
    box-shadow: 0 4px 10px rgb(16 185 129 / 0.5);
  }
}`;
}

function PlayGlyph() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current" aria-hidden="true">
      <path d="M2.4 1.2a.6.6 0 0 1 .93-.5l7 5.2a.6.6 0 0 1 0 .98l-7 5.2a.6.6 0 0 1-.93-.5z" />
    </svg>
  );
}

function ResetGlyph() {
  return (
    <svg
      viewBox="0 0 12 12"
      className="h-3 w-3 fill-none stroke-current stroke-[1.4]"
      aria-hidden="true"
    >
      <path d="M2 3.4A4.5 4.5 0 1 1 1.9 7" strokeLinecap="round" />
      <path d="M2.4 7.4V3.2h4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Timeline = { start: number; totalMs: number };

/**
 * Animated key path: one dot follows a bitcoin send through a Trezor
 * Safe 7 and changes colour as its meaning changes — amber for the
 * unsigned transaction, gold for the private key (which never leaves the
 * device), green for the signed transaction. The dot stays at its last
 * stop until the user resets the simulation.
 */
export function KeyPathDiagram() {
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timersRef = useRef<number[]>([]);
  const rafRef = useRef(0);
  const timelineRef = useRef<Timeline | null>(null);

  const [speed, setSpeed] = useState<SpeedId>("fast");
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [reached, setReached] = useState<ReadonlySet<StepId>>(new Set());
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const update = () =>
      setGeometry(measure(stage, nodeRefs.current, SPEEDS[speed].pxPerMs));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(stage);

    return () => {
      observer.disconnect();
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      timelineRef.current = null;
    };
  }, [speed]);

  function stopFollow() {
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    timelineRef.current = null;
  }

  /**
   * Pans the scroll container so the traveling dot stays centred. While
   * the simulation runs the container is not scrollable by the user.
   */
  function startFollow(timeline: Timeline) {
    stopFollow();
    timelineRef.current = timeline;

    const tick = () => {
      if (!timelineRef.current) return;

      const scroller = scrollerRef.current;
      const stage = stageRef.current;
      if (!scroller || !stage) return;

      const elapsed = performance.now() - timelineRef.current.start;
      if (elapsed > timelineRef.current.totalMs) return;

      const dot = stage.querySelector<HTMLSpanElement>(".kp-dot");
      if (dot) {
        const dotRect = dot.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        // Both rects are viewport-relative, so their difference is already
        // the dot's position inside the stage content.
        const contentX = dotRect.left - stageRect.left;
        const maxScroll = scroller.scrollWidth - scroller.clientWidth;
        scroller.scrollLeft = Math.min(
          Math.max(0, contentX - scroller.clientWidth / 2),
          maxScroll,
        );
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }

  function clearTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }

  function reach(id: StepId) {
    setReached((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }

  function play() {
    if (!geometry) return;

    clearTimers();
    stopFollow();

    setReached(new Set());
    setPhase("playing");
    setRunId((id) => id + 1);

    startFollow({
      start: performance.now(),
      totalMs: geometry.totalMs,
    });

    geometry.milestones.forEach((milestone) => {
      timersRef.current.push(
        window.setTimeout(() => reach(milestone.id), milestone.ms),
      );
    });
    timersRef.current.push(
      window.setTimeout(() => {
        stopFollow();
        setPhase("done");
      }, geometry.totalMs),
    );
  }

  function reset() {
    clearTimers();
    stopFollow();
    setReached(new Set());
    setPhase("idle");
  }

  const status =
    phase === "playing"
      ? "Following the transaction through the device…"
      : phase === "done"
        ? "Signed: the private key never left the Trezor Safe 7 — only the signature went out. Reset the animation to run it again."
        : "Press play to follow what happens to the keys when the Trezor signs a send.";

  const dotIdleStyle = {
    offsetPath: geometry ? `path('${geometry.fullPath}')` : undefined,
    offsetDistance: "0%",
    backgroundColor: "rgb(245 158 11)",
    boxShadow: "0 4px 10px rgb(245 158 11 / 0.45)",
  };

  const dotDoneStyle = {
    offsetPath: geometry ? `path('${geometry.fullPath}')` : undefined,
    offsetDistance: "100%",
    backgroundColor: "rgb(16 185 129)",
    boxShadow: "0 4px 10px rgb(16 185 129 / 0.5)",
  };

  return (
    <figure className="flex flex-col gap-4 rounded-3xl bg-white p-3 text-zinc-900 [color-scheme:light] sm:p-4">
      <style>{`
        @keyframes kp-reach-pulse {
          0% { transform: scale(1); }
          40% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        .kp-dot {
          position: absolute;
          top: 0;
          left: 0;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          offset-anchor: 0% 50%;
          margin-left: -8px;
        }
        .kp-reached {
          animation: kp-reach-pulse 0.6s ease;
        }
        ${geometry
          ? travelKeyframes(geometry.amberEndPct, geometry.goldEndPct)
          : ""}
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Unsigned transaction
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 ring-2 ring-yellow-200" />
            Private key
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Signed transaction
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[4px] border border-sky-300 bg-sky-100" />
            Reached element
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Simulation speed"
            className="flex items-center gap-0.5 rounded-full border border-zinc-200 p-0.5 text-xs font-semibold"
          >
            {(Object.keys(SPEEDS) as SpeedId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSpeed(id)}
                disabled={phase === "playing"}
                aria-pressed={speed === id}
                className={`rounded-full px-3 py-1 transition-colors disabled:cursor-not-allowed ${
                  speed === id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {SPEEDS[id].label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={phase === "done" ? reset : play}
            disabled={phase === "playing" || !geometry}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"
          >
            {phase === "playing" ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Sending bitcoin…
              </>
            ) : phase === "done" ? (
              <>
                <ResetGlyph />
                Reset animation
              </>
            ) : (
              <>
                <PlayGlyph />
                Play simulation (send bitcoin)
              </>
            )}
          </button>
        </div>
      </div>

      <p aria-live="polite" className="min-h-5 text-sm text-zinc-600">
        {status}
      </p>

      <div
        ref={scrollerRef}
        className={`rounded-2xl border border-zinc-100 ${
          phase === "playing" ? "overflow-x-hidden" : "overflow-x-auto"
        }`}
      >
        <div
          ref={stageRef}
          className="relative flex w-max items-stretch gap-6 px-10 pt-16 pb-14"
        >
          {geometry && (
            <>
              {/* The device boundary: keys never cross it. */}
              <div
                aria-hidden="true"
                className="absolute z-0 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/70"
                style={geometry.deviceBox}
              >
                <span className="absolute -top-3 left-3 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-300">
                  Trezor Safe 7 — the keys never leave this box
                </span>
              </div>

              {/* Connectors and lanes. */}
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 h-full w-full"
              >
                {CONNECTED_PAIRS.map(([fromId, toId]) => {
                  const fromIndex = STEPS.findIndex(
                    (step) => step.id === fromId,
                  );
                  const toIndex = STEPS.findIndex((step) => step.id === toId);
                  const from = geometry.cards[fromIndex] ?? { r: 0, cy: 0 };
                  const to = geometry.cards[toIndex] ?? { l: 0, cy: 0 };
                  const gold =
                    (fromId === "secure-elements" && reached.has("flash")) ||
                    (fromId === "flash" && reached.has("signing")) ||
                    (fromId === "screen" &&
                      reached.has("secure-elements"));
                  return (
                    <line
                      key={fromId}
                      x1={from.r}
                      y1={from.cy}
                      x2={to.l}
                      y2={to.cy}
                      strokeWidth={gold ? 2.5 : 1.5}
                      strokeLinecap="round"
                      className={
                        gold
                          ? "stroke-yellow-400 transition-colors duration-500"
                          : "stroke-zinc-300"
                      }
                    />
                  );
                })}

                <path
                  d={geometry.railPath}
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  className="stroke-emerald-300"
                  strokeDasharray="1 7"
                />

                <text
                  x={
                    ((geometry.cards[7]?.r ?? 0) +
                      (geometry.cards[2]?.r ?? 0)) /
                    2
                  }
                  y={geometry.railY + 16}
                  textAnchor="middle"
                  className="select-none fill-emerald-600 text-[10px] font-medium"
                >
                  signed transaction
                </text>
                <text
                  x={geometry.broadcastLabel.x}
                  y={geometry.broadcastLabel.y}
                  textAnchor="middle"
                  className="select-none fill-emerald-600 text-[10px] font-medium"
                >
                  broadcast
                </text>
              </svg>

              {/* The traveling dot: one dot, three roles, three colours. */}
              {phase === "playing" && (
                <div
                  key={runId}
                  className="pointer-events-none absolute inset-0 z-30"
                >
                  <span
                    className="kp-dot"
                    style={{
                      offsetPath: `path('${geometry.fullPath}')`,
                      animation: `kp-travel ${geometry.totalMs}ms linear 0ms both`,
                    }}
                  />
                </div>
              )}

              {/* At rest the dot waits at its stop: the start before the
                  first run, the network after a finished one. */}
              {phase === "idle" && (
                <div className="pointer-events-none absolute inset-0 z-30">
                  <span className="kp-dot" style={dotIdleStyle} />
                </div>
              )}
              {phase === "done" && (
                <div className="pointer-events-none absolute inset-0 z-30">
                  <span className="kp-dot" style={dotDoneStyle} />
                </div>
              )}
            </>
          )}

          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isReached = reached.has(step.id);
            const isTouched = step.touchesKeys && isReached;

            return (
              <div
                key={step.id}
                ref={(node) => {
                  nodeRefs.current[index] = node;
                }}
                className={`relative z-20 flex w-44 shrink-0 flex-col gap-2 rounded-2xl border bg-white p-3 shadow-sm transition-all duration-500 ${
                  isTouched
                    ? "kp-reached border-yellow-400 bg-yellow-50 shadow-md shadow-yellow-200/60"
                    : isReached
                      ? "kp-reached border-sky-400 bg-sky-50 shadow-md shadow-sky-200/60"
                      : "border-zinc-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors duration-500 ring-inset ${
                      isTouched
                        ? "bg-yellow-100 text-yellow-700 ring-yellow-300"
                        : isReached
                          ? "bg-sky-100 text-sky-700 ring-sky-300"
                          : "bg-zinc-100 text-zinc-600 ring-zinc-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-5 font-semibold text-zinc-900">
                      {step.hardware}
                    </p>
                    <p className="text-xs leading-4 text-zinc-500">
                      {step.software}
                    </p>
                  </div>
                </div>

                <p className="text-xs leading-5 text-zinc-600">{step.action}</p>

                {step.touchesKeys && (
                  <span
                    className={`self-start rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase transition-colors duration-500 ${
                      isTouched
                        ? "bg-yellow-400 text-yellow-950"
                        : "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200 ring-inset"
                    }`}
                  >
                    Touches the keys
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </figure>
  );
}
