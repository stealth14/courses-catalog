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
  NoteIcon,
  ShieldIcon,
  SignedNoteIcon,
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
 * Selectable trace speeds, in px/ms. Slow enough that the eye can follow
 * each traveller and read the stop it lands on.
 */
const SPEEDS = {
  fast: { label: "Fast", pxPerMs: 0.3 },
  normal: { label: "Normal", pxPerMs: 0.18 },
} as const;

type SpeedId = keyof typeof SPEEDS;

/**
 * The beat a traveller keeps once it reaches its stop, so the arrival
 * registers before the next one sets off.
 */
const HOLD_MS = 900;

/**
 * How long the private key takes to come into being at the secure element,
 * before it starts to move.
 */
const BIRTH_MS = 700;

/**
 * How long the two arrivals at the signing microcontroller breathe against
 * each other while it builds the signature, before the signed transaction
 * leaves from between them.
 */
const SIGN_MS = 1400;

/** The three things that move through the diagram, in the order they appear. */
type TrackId = "unsigned" | "key" | "signed";

type Track = {
  /** The route the traveller follows, as an SVG path. */
  path: string;
  delayMs: number;
  durationMs: number;
  /** When the camera should start following this traveller: its birth, so
   * the pan to where it appears happens while it is still materializing. */
  focusMs: number;
  /** The same route as points and their cumulative lengths, so the camera
   * can work out where a traveller is without reading the DOM. */
  points: Point[];
  cum: number[];
};

type Actor = {
  id: TrackId;
  label: string;
  icon: ComponentType<FirmwareIconProps>;
  /** Colours of the icon and of the pointer that shows where it is going. */
  tone: string;
  /** Filled badge colours, used by all three travellers. */
  badgeTone: string;
  /** Ring around the badge. */
  ring: string;
};

/**
 * Who travels when. Trezor Suite builds the unsigned transaction, the
 * private key only ever moves inside the device, and the signed transaction
 * goes back out. Each traveller stops where its phase ends.
 */
const ACTORS: Actor[] = [
  {
    id: "unsigned",
    label: "Unsigned transaction",
    icon: NoteIcon,
    tone: "text-orange-600",
    badgeTone: "bg-orange-100 text-orange-700",
    ring: "ring-orange-400",
  },
  {
    id: "key",
    label: "Private key",
    icon: KeyIcon,
    tone: "text-yellow-600",
    badgeTone: "bg-yellow-100 text-yellow-700",
    ring: "ring-yellow-400",
  },
  {
    id: "signed",
    label: "Signed transaction",
    icon: SignedNoteIcon,
    tone: "text-emerald-600",
    badgeTone: "bg-emerald-100 text-emerald-700",
    ring: "ring-emerald-400",
  },
];

type Point = { x: number; y: number };

type CardRect = { l: number; t: number; r: number; b: number; cy: number };

type Milestone = { id: StepId; ms: number };

type Geometry = {
  cards: CardRect[];
  /** The icon containers the connectors meet. */
  icons: CardRect[];
  tracks: Record<TrackId, Track>;
  /** Vertical centre of the lane the travellers ride on. */
  laneY: number;
  totalMs: number;
  /** When the unsigned transaction and the key both stand on the signing
   * chip, and when the signed one leaves. */
  signStartMs: number;
  /** When the key materializes at the secure element, before it moves. */
  keyBornMs: number;
  /** When the unsigned transaction is built at Trezor Suite. */
  unsignedBornMs: number;
  /** When the signed transaction is created on the signing chip. */
  signedBornMs: number;
  /** When the signed transaction lands on the network, which starts the
   * broadcast. */
  travelEndMs: number;
  milestones: Milestone[];
  signingPoint: Point;
  broadcastPoint: Point;
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

/** Running length of a polyline at each of its points. */
function cumulativeLength(points: Point[]) {
  const cum = [0];
  for (let index = 1; index < points.length; index++) {
    cum.push(cum[index - 1] + segmentLength(points[index - 1], points[index]));
  }
  return cum;
}

/**
 * Where a traveller sits on its route at a moment of the run. The routes are
 * polylines travelled at a constant speed, so this matches the CSS animation
 * exactly while costing no layout reads.
 */
function pointAt(track: Track, ms: number): Point {
  const progress = Math.min(
    1,
    Math.max(0, (ms - track.delayMs) / track.durationMs),
  );
  const total = track.cum[track.cum.length - 1] || 1;
  const distance = progress * total;

  for (let index = 1; index < track.points.length; index++) {
    if (distance <= track.cum[index] || index === track.points.length - 1) {
      const span = track.cum[index] - track.cum[index - 1] || 1;
      const t = (distance - track.cum[index - 1]) / span;
      const from = track.points[index - 1];
      const to = track.points[index];
      return {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      };
    }
  }
  return track.points[track.points.length - 1];
}

/**
 * Builds the three journeys along the lane and when each traveller
 * reaches each stop:
 * - unsigned transaction: Suite -> USB -> firmware -> screen -> signing
 * - private key: born at the secure element -> flash -> signing
 * - signed transaction: signing -> USB -> Suite -> network
 * The cards sit above the lane, each linked to its stop by a connector.
 * The two travellers that meet at the signing chip stop on either side of
 * it, so both stay visible while the signature is built, and the signed
 * one leaves from the middle of them.
 */
function measure(
  stage: HTMLDivElement,
  nodes: (HTMLButtonElement | null)[],
  iconNodes: (HTMLSpanElement | null)[],
  pxPerMs: number,
) {
  const stageRect = stage.getBoundingClientRect();

  const fallback: CardRect = { l: 0, t: 0, r: 0, b: 0, cy: 0 };
  const toRect = (node: Element | null): CardRect => {
    if (!node) return fallback;
    const rect = node.getBoundingClientRect();
    return {
      l: rect.left - stageRect.left,
      t: rect.top - stageRect.top,
      r: rect.right - stageRect.left,
      b: rect.bottom - stageRect.top,
      cy: rect.top + rect.height / 2 - stageRect.top,
    };
  };

  const cards: CardRect[] = nodes.map(toRect);
  const icons: CardRect[] = iconNodes.map(toRect);

  // Cards in reading order: 0 network, 1 suite, 2 usb, 3 firmware,
  // 4 screen, 5 secure elements, 6 flash, 7 signing.
  const rect = (index: number) => cards[index] ?? fallback;

  // The lane runs straight across the stage, below the cards.
  const laneY = stage.offsetHeight - 40;
  const stopX = (index: number) => (rect(index).l + rect(index).r) / 2;
  const laneStop = (index: number, dx = 0): Point => ({
    x: stopX(index) + dx,
    y: laneY,
  });

  // How far each of the two arrivals at the signing chip parks from its
  // centre, just enough for the pair to sit side by side without touching.
  const SIGN_GAP = 20;

  // Amber phase: the unsigned transaction travels host -> device, is shown
  // on the screen and ends on the signing chip.
  const amberPoints = [
    laneStop(1),
    laneStop(2),
    laneStop(3),
    laneStop(4),
    laneStop(7, -SIGN_GAP),
  ];

  // The key is not carried in from anywhere: the secure element releases
  // it, so it appears on that card's stop and only then sets off.
  const goldPoints = [laneStop(5), laneStop(6), laneStop(7, SIGN_GAP)];

  // Green phase: the signed transaction returns through the USB cable
  // to Trezor Suite, which broadcasts it to the network.
  const greenPoints = [laneStop(7), laneStop(2), laneStop(1), laneStop(0)];

  const ms = (length: number) => Math.round(length / pxPerMs);

  /** When a traveller reaches each point of its own route. */
  const legs = (points: Point[]) => {
    const times = [0];
    for (let index = 1; index < points.length; index++) {
      times.push(
        times[index - 1] + ms(segmentLength(points[index - 1], points[index])),
      );
    }
    return times;
  };

  const amberTimes = legs(amberPoints);
  const goldTimes = legs(goldPoints);
  const greenTimes = legs(greenPoints);

  const unsignedMs = amberTimes[amberTimes.length - 1];
  const keyMs = goldTimes[goldTimes.length - 1];
  const signedMs = greenTimes[greenTimes.length - 1];

  // Nothing is already in flight: the unsigned transaction is built at
  // Trezor Suite and only then travels in, the key is released by the secure
  // element, the two that meet at the chip hold while it signs, and the run
  // ends once the signed transaction settles on the network.
  const unsignedBornMs = 0;
  const unsignedDelayMs = unsignedBornMs + BIRTH_MS;
  const keyBornMs = unsignedDelayMs + unsignedMs + HOLD_MS;
  const keyDelayMs = keyBornMs + BIRTH_MS;
  const signStartMs = keyDelayMs + keyMs + HOLD_MS;
  const signedBornMs = signStartMs + SIGN_MS;
  const signedDelayMs = signedBornMs + BIRTH_MS;
  const travelEndMs = signedDelayMs + signedMs;
  const totalMs = travelEndMs + HOLD_MS;

  const milestones: Milestone[] = [
    { id: "suite", ms: 0 },
    { id: "usb", ms: unsignedDelayMs + amberTimes[1] },
    { id: "firmware", ms: unsignedDelayMs + amberTimes[2] },
    { id: "screen", ms: unsignedDelayMs + amberTimes[3] },
    { id: "secure-elements", ms: keyBornMs },
    { id: "flash", ms: keyDelayMs + goldTimes[1] },
    { id: "signing", ms: keyDelayMs + keyMs },
    { id: "network", ms: travelEndMs },
  ];

  // The device elements, labels included, so the box never cuts them.
  const deviceCards = cards.slice(DEVICE_RANGE[0], DEVICE_RANGE[1] + 1);
  const left = Math.min(...deviceCards.map((item) => item.l));
  const right = Math.max(...deviceCards.map((item) => item.r));
  const top = Math.min(...deviceCards.map((item) => item.t));

  const track = (
    points: Point[],
    focusMs: number,
    delayMs: number,
    durationMs: number,
  ): Track => ({
    path: toPath(points),
    delayMs,
    durationMs,
    focusMs,
    points,
    cum: cumulativeLength(points),
  });

  return {
    cards,
    icons,
    tracks: {
      unsigned: track(amberPoints, 0, unsignedDelayMs, unsignedMs),
      key: track(goldPoints, keyBornMs, keyDelayMs, keyMs),
      signed: track(greenPoints, signedBornMs, signedDelayMs, signedMs),
    },
    laneY,
    totalMs,
    signStartMs,
    keyBornMs,
    unsignedBornMs,
    signedBornMs,
    travelEndMs,
    milestones,
    signingPoint: laneStop(7),
    broadcastPoint: laneStop(0),
    broadcastLabel: {
      x: (stopX(0) + stopX(1)) / 2,
      y: laneY + 18,
    },
    // The box covers the device elements with their floating labels, their
    // connectors and the lane segment the key travels, which never leaves it.
    deviceBox: {
      left: left - 16,
      top: top - 14,
      width: right - left + 32,
      height: laneY + 18 - (top - 14),
    },
  };
}

/** Wifi arcs leaving the network node once the transaction is broadcast. */
function BroadcastWaves({
  point,
  delayMs,
}: {
  point: Point;
  delayMs: number;
}) {
  return (
    <div
      className="kp-waves"
      style={{ left: point.x, top: point.y }}
      aria-hidden="true"
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="kp-wave"
          style={{ animationDelay: `${delayMs + index * 240}ms` }}
        />
      ))}
    </div>
  );
}

/**
 * One traveller: a badge with the icon of what is moving. The badge itself
 * never turns — the icon keeps its orientation — while a pointer on its
 * leading edge takes the direction of the route. On arrival the pointer
 * goes away and the badge holds that stop long enough to be read. A
 * traveller with `born` is not carried in from anywhere: it materializes at
 * the start of its route before it sets off. With `rest` it is parked at
 * that point of its route instead (the start before the run, the end after
 * it); with `hold` it keeps breathing there once the signing chip has both
 * of its visitors.
 */
function Traveller({
  actor,
  track,
  rest,
  born,
  hold,
}: {
  actor: Actor;
  track: Track;
  rest?: 0 | 100;
  born?: number;
  hold?: number;
}) {
  const Icon = actor.icon;
  const badge = `kp-badge shadow-md ${actor.badgeTone}`;
  const path = `path('${track.path}')`;

  if (rest !== undefined) {
    return (
      <div
        className={badge}
        style={{
          offsetPath: path,
          offsetDistance: `${rest}%`,
          opacity: 1,
        }}
      >
        <Icon className="h-4 w-4" />
      </div>
    );
  }

  const arrivalMs = track.delayMs + track.durationMs;
  const travel = `kp-travel ${track.durationMs}ms linear ${track.delayMs}ms forwards`;
  const appear =
    born === undefined
      ? ""
      : `, kp-born ${BIRTH_MS}ms cubic-bezier(0.4, 0, 0.2, 1) ${born}ms forwards`;
  const breathe =
    hold === undefined ? "" : `, kp-work ${SIGN_MS}ms ease-in-out ${hold}ms`;

  return (
    <>
      <div
        className={`kp-marker ${actor.tone}`}
        style={{ offsetPath: path, animation: travel }}
      >
        <span
          className="kp-nose"
          style={{
            animation: `kp-nose-out 160ms linear ${arrivalMs}ms forwards`,
          }}
        />
      </div>
      {/* A spark opens out of the route's first point as the traveller
          materializes there. */}
      {born !== undefined && (
        <div
          className={`kp-birth ${actor.tone}`}
          style={{ offsetPath: path, offsetDistance: "0%" }}
          aria-hidden="true"
        >
          <span
            className="kp-birth-ring"
            style={{ animationDelay: `${born}ms` }}
          />
          <span
            className="kp-birth-glow"
            style={{ animationDelay: `${born}ms` }}
          />
        </div>
      )}
      <div
        data-track={actor.id}
        className={badge}
        style={{ offsetPath: path, animation: `${travel}${appear}${breathe}` }}
      >
        <Icon className="h-4 w-4" />
      </div>
    </>
  );
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

type Timeline = {
  start: number;
  totalMs: number;
  tracks: Record<TrackId, Track>;
};

/** Which traveller the camera follows (or rests on) right now. */
function activeTrack(
  tracks: Record<TrackId, Track>,
  elapsed: number,
): TrackId {
  if (elapsed >= tracks.signed.focusMs) return "signed";
  if (elapsed >= tracks.key.focusMs) return "key";
  return "unsigned";
}

/**
 * Animated key path: three travellers follow a bitcoin send through a
 * Trezor Safe 7 — the unsigned transaction from Trezor Suite in, the
 * private key inside the device, and the signed transaction back out.
 * The first two meet on the signing chip, where they stay while the
 * signature is built, and the network keeps broadcasting once everything
 * has landed. All three stay on the diagram until the user resets it.
 */
export function KeyPathDiagram() {
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timersRef = useRef<number[]>([]);
  const rafRef = useRef(0);
  const timelineRef = useRef<Timeline | null>(null);

  const [speed, setSpeed] = useState<SpeedId>("fast");
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [reached, setReached] = useState<ReadonlySet<StepId>>(new Set());
  const [runId, setRunId] = useState(0);
  const [detailId, setDetailId] = useState<StepId | null>(null);

  const detailStep = STEPS.find((step) => step.id === detailId) ?? null;

  useEffect(() => {
    if (!detailStep) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetailId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailStep]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const update = () =>
      setGeometry(
        measure(
          stage,
          nodeRefs.current,
          iconRefs.current,
          SPEEDS[speed].pxPerMs,
        ),
      );
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
   * Pans the scroll container so the traveller being followed stays centred.
   * While the simulation runs the container is not scrollable by the user.
   *
   * The traveller's position is computed from its route instead of measured
   * in the DOM: reading rects and rewriting the scroll offset every frame
   * makes the browser repaint the whole stage, which shows up as stutter.
   * The pan itself is smoothed, because the camera hands over from one
   * traveller to the next at different points of the lane and snapping there
   * would read as a jolt.
   */
  function startFollow(timeline: Timeline) {
    stopFollow();
    timelineRef.current = timeline;

    let camera: {
      originX: number;
      halfView: number;
      maxScroll: number;
    } | null = null;
    /** How quickly the pan catches up with its target, in ms. */
    const EASE_MS = 150;
    let offset = Number.NaN;
    let written = Number.NaN;
    let lastFrame = 0;

    /**
     * Measured on the first frame rather than now: the run has not switched
     * the container to `overflow-x: hidden` yet, and that changes
     * `clientWidth` by the width of the scrollbar.
     */
    const measureCamera = () => {
      const scroller = scrollerRef.current;
      const stage = stageRef.current;
      if (!scroller || !stage) return null;
      return {
        originX:
          stage.getBoundingClientRect().left -
          scroller.getBoundingClientRect().left -
          scroller.clientLeft +
          scroller.scrollLeft,
        halfView: scroller.clientWidth / 2,
        maxScroll: scroller.scrollWidth - scroller.clientWidth,
      };
    };

    const tick = (now: number) => {
      const current = timelineRef.current;
      if (!current) return;

      const scroller = scrollerRef.current;
      const elapsed = now - current.start;
      if (!scroller || elapsed > current.totalMs) return;

      camera = camera ?? measureCamera();
      if (!camera) return;

      const track = current.tracks[activeTrack(current.tracks, elapsed)];
      // Leading the target by the easing time cancels the lag the smoothing
      // would otherwise show while a traveller is on the move.
      const target = Math.min(
        Math.max(
          0,
          camera.originX +
            pointAt(track, elapsed + EASE_MS).x -
            camera.halfView,
        ),
        camera.maxScroll,
      );

      if (Number.isNaN(offset)) {
        offset = target;
      } else {
        const dt = lastFrame ? Math.min(64, now - lastFrame) : 16;
        offset += (target - offset) * (1 - Math.exp(-dt / EASE_MS));
      }
      lastFrame = now;

      if (!(Math.abs(offset - written) < 0.5)) {
        scroller.scrollLeft = offset;
        written = offset;
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
      tracks: geometry.tracks,
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
      ? "Following the send: the unsigned transaction travels in, meets the private key on the signing chip, and the signed transaction goes out."
      : phase === "done"
        ? "Signed: the private key never left the Trezor Safe 7 — only the signature went out, and the network keeps broadcasting it. The travellers stay here until you reset."
        : "Press play to follow what happens to the keys when the Trezor signs a send. Click a component to read what it does.";

  return (
    <figure className="flex flex-col gap-4 rounded-3xl bg-white p-3 text-zinc-900 [color-scheme:light] sm:p-4">
      <style>{`
        @keyframes kp-reach-pulse {
          0% { transform: scale(1); }
          40% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        @keyframes kp-travel {
          from { offset-distance: 0%; opacity: 1; }
          to { offset-distance: 100%; opacity: 1; }
        }
        /* The badge grows into place: one direction, no overshoot, so it
           reads as appearing rather than wobbling. */
        @keyframes kp-born {
          from { opacity: 0; transform: scale(0.3); }
          to { opacity: 1; transform: scale(1); }
        }
        /* A traveller materializes at its origin: a ring widens away and a
           glow swells underneath it. */
        @keyframes kp-birth-ring {
          from { opacity: 0.9; transform: scale(0.3); }
          to { opacity: 0; transform: scale(2.2); }
        }
        @keyframes kp-birth-glow {
          from { opacity: 0.5; transform: scale(0.4); }
          to { opacity: 0; transform: scale(1.7); }
        }
        /* The two arrivals at the signing chip breathe together, once, while
           it works: a single slow swell instead of a back-and-forth. */
        @keyframes kp-work {
          from { transform: scale(1); }
          50% { transform: scale(1.07); }
          to { transform: scale(1); }
        }
        /* A dashed ring turns around the pair while the signature is built,
           then dissolves. */
        @keyframes kp-sign {
          from { opacity: 0; transform: rotate(0deg) scale(0.85); }
          12% { opacity: 1; transform: rotate(24deg) scale(1); }
          86% { opacity: 1; transform: rotate(300deg) scale(1); }
          to { opacity: 0; transform: rotate(320deg) scale(1); }
        }
        /* Wifi arcs: each one grows out of the node and fades away. */
        @keyframes kp-wave {
          0% { opacity: 0; transform: scale(0.4); }
          25% { opacity: 0.85; }
          100% { opacity: 0; transform: scale(1.7); }
        }
        @keyframes kp-nose-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .kp-badge {
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          width: 28px;
          height: 28px;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          offset-anchor: 50% 50%;
          offset-rotate: 0deg;
          opacity: 0;
          will-change: transform, opacity;
        }
        /* Carries the pointer and nothing else: it is the only part that
           turns with the route. */
        .kp-marker {
          position: absolute;
          top: 0;
          left: 0;
          width: 28px;
          height: 28px;
          offset-anchor: 50% 50%;
          offset-rotate: auto;
          opacity: 0;
        }
        /* Sits on the first point of the route; its children do the
           showing, so nothing here needs an opacity of its own. */
        .kp-birth {
          position: absolute;
          top: 0;
          left: 0;
          width: 28px;
          height: 28px;
          offset-anchor: 50% 50%;
          offset-rotate: 0deg;
        }
        .kp-birth span {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          will-change: transform, opacity;
        }
        .kp-birth-ring {
          border: 2px solid currentColor;
          animation: kp-birth-ring ${BIRTH_MS}ms ease-out both;
        }
        .kp-birth-glow {
          background-color: currentColor;
          animation: kp-birth-glow ${BIRTH_MS}ms ease-out both;
        }
        /* Anchored on the signing node, wide enough to enclose both of the
           travellers waiting on it. */
        .kp-sign {
          position: absolute;
          width: 0;
          height: 0;
          color: #ca8a04;
          opacity: 0;
        }
        .kp-sign-ring,
        .kp-sign-core {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 9999px;
        }
        .kp-sign-ring {
          width: 92px;
          height: 92px;
          margin: -46px 0 0 -46px;
          border: 2px dashed currentColor;
          will-change: transform, opacity;
        }
        .kp-sign-core {
          width: 54px;
          height: 54px;
          margin: -27px 0 0 -27px;
          background-color: currentColor;
          opacity: 0.14;
          will-change: transform, opacity;
        }
        /* Each arc is a ring showing only its top quarter, so it reads as a
           wifi wave climbing out of the node. */
        .kp-waves {
          position: absolute;
          width: 0;
          height: 0;
          color: #059669;
        }
        .kp-wave {
          position: absolute;
          top: -44px;
          left: -22px;
          width: 44px;
          height: 44px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 9999px;
          opacity: 0;
          animation: kp-wave 1.3s ease-out infinite;
        }
        .kp-nose {
          position: absolute;
          top: 50%;
          left: 25px;
          width: 0;
          height: 0;
          margin-top: -5px;
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
          border-left: 9px solid currentColor;
        }
        /* Promoting the pulsing card and the travellers keeps their scale
           animations off the main thread, so a shadow is not re-rasterized
           frame by frame. */
        .kp-reached {
          animation: kp-reach-pulse 0.6s ease;
          will-change: transform;
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-600">
          {ACTORS.map((actor) => {
            const Icon = actor.icon;
            return (
              <span key={actor.id} className="inline-flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm ring-2 ${actor.tone} ${actor.ring}`}
                >
                  <Icon className="h-3 w-3" />
                </span>
                {actor.label}
              </span>
            );
          })}
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
          className="relative flex w-max items-end gap-6 px-10 pt-20 pb-28"
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

              {/* Lane, card connectors and lane stops. */}
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 h-full w-full"
              >
                <line
                  x1={(geometry.cards[0].l + geometry.cards[0].r) / 2}
                  y1={geometry.laneY}
                  x2={(geometry.cards[7].l + geometry.cards[7].r) / 2}
                  y2={geometry.laneY}
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="stroke-zinc-300"
                />

                {STEPS.map((step, index) => {
                  const card = geometry.cards[index] ?? { l: 0, r: 0 };
                  const iconBox = geometry.icons[index] ?? { b: 0 };
                  const cx = (card.l + card.r) / 2;
                  const isReached = reached.has(step.id);
                  const isTouched = step.touchesKeys && isReached;
                  const lit = isTouched
                    ? "stroke-yellow-400 fill-yellow-400"
                    : isReached
                      ? "stroke-sky-400 fill-sky-400"
                      : "stroke-zinc-300 fill-white";
                  return (
                    <g key={step.id}>
                      {/* The connector meets the icon container itself. */}
                      <line
                        x1={cx}
                        y1={iconBox.b}
                        x2={cx}
                        y2={geometry.laneY}
                        strokeWidth={1.5}
                        className={`transition-colors duration-500 ${lit}`}
                      />
                      <circle
                        cx={cx}
                        cy={geometry.laneY}
                        r={4}
                        strokeWidth={1.5}
                        className={`transition-colors duration-500 ${lit}`}
                      />
                    </g>
                  );
                })}

                <text
                  x={geometry.broadcastLabel.x}
                  y={geometry.broadcastLabel.y}
                  textAnchor="middle"
                  className="select-none fill-emerald-600 text-[10px] font-medium"
                >
                  broadcast
                </text>
              </svg>

              {/* Once the signed transaction lands, the network node keeps
                  emitting wifi waves until the diagram is reset. */}
              {phase !== "idle" && (
                <div
                  key={`waves-${runId}`}
                  className="pointer-events-none absolute inset-0 z-20"
                >
                  <BroadcastWaves
                    point={geometry.broadcastPoint}
                    delayMs={geometry.travelEndMs}
                  />
                </div>
              )}

              {/* Three travellers, one after another. Each one follows its
                  own route, stops where its job ends, and stays there: at
                  the end of the run all three sit on the diagram. */}
              {phase === "playing" && (
                <div
                  key={runId}
                  className="pointer-events-none absolute inset-0 z-30"
                >
                  {ACTORS.map((actor) => (
                    <Traveller
                      key={actor.id}
                      actor={actor}
                      track={geometry.tracks[actor.id]}
                      born={
                        actor.id === "key"
                          ? geometry.keyBornMs
                          : actor.id === "unsigned"
                            ? geometry.unsignedBornMs
                            : geometry.signedBornMs
                      }
                      hold={
                        actor.id === "signed"
                          ? undefined
                          : geometry.signStartMs
                      }
                    />
                  ))}

                  {/* The signing chip works on the pair it has in hand. */}
                  <div
                    className="kp-sign"
                    aria-hidden="true"
                    style={{
                      left: geometry.signingPoint.x,
                      top: geometry.signingPoint.y,
                      animation: `kp-sign ${SIGN_MS}ms ease-in-out ${geometry.signStartMs}ms forwards`,
                    }}
                  >
                    <span className="kp-sign-core" />
                    <span className="kp-sign-ring" />
                  </div>
                </div>
              )}

              {/* At rest only the unsigned transaction waits at the start of
                  its route. */}
              {phase === "idle" && (
                <div className="pointer-events-none absolute inset-0 z-30">
                  <Traveller
                    actor={ACTORS[0]}
                    track={geometry.tracks.unsigned}
                    rest={0}
                  />
                </div>
              )}

              {/* After the run every traveller stays where it stopped. */}
              {phase === "done" && (
                <div className="pointer-events-none absolute inset-0 z-30">
                  {ACTORS.map((actor) => (
                    <Traveller
                      key={actor.id}
                      actor={actor}
                      track={geometry.tracks[actor.id]}
                      rest={100}
                    />
                  ))}
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
                className="relative z-20 flex w-36 shrink-0 justify-center"
              >
                <button
                  type="button"
                  ref={(node) => {
                    nodeRefs.current[index] = node;
                  }}
                  onClick={() => setDetailId(step.id)}
                  aria-haspopup="dialog"
                  aria-label={`${step.hardware} (${step.software}). Show details`}
                  className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
                >
                  {/* The label floats above the icon, outside any box. */}
                  <span className="text-center">
                    <span className="block text-sm leading-5 font-semibold text-zinc-900">
                      {step.hardware}
                    </span>
                    <span className="block text-xs leading-4 text-zinc-500">
                      {step.software}
                    </span>
                  </span>

                  <span
                    ref={(node) => {
                      iconRefs.current[index] = node;
                    }}
                    className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ring-1 transition-all duration-500 ring-inset group-hover:-translate-y-0.5 group-hover:shadow-md ${
                      isTouched
                        ? "kp-reached bg-yellow-50 text-yellow-700 ring-yellow-400 shadow-yellow-200/60"
                        : isReached
                          ? "kp-reached bg-sky-50 text-sky-700 ring-sky-400 shadow-sky-200/60"
                          : "bg-white text-zinc-600 ring-zinc-200 group-hover:ring-zinc-400"
                    }`}
                  >
                    <Icon className="h-8 w-8" />
                    {step.touchesKeys && (
                      <span
                        aria-hidden="true"
                        title="Touches the keys"
                        className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[9px] ring-1 ring-inset transition-colors duration-500 ${
                          isTouched
                            ? "bg-yellow-400 text-yellow-950 ring-yellow-500"
                            : "bg-zinc-100 text-zinc-500 ring-zinc-300"
                        }`}
                      >
                        <KeyIcon className="h-3 w-3" />
                      </span>
                    )}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {detailStep && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
          role="presentation"
          onClick={() => setDetailId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="kp-detail-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-5 text-zinc-900 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200 ring-inset">
                {(() => {
                  const Icon = detailStep.icon;
                  return <Icon className="h-5 w-5" />;
                })()}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  id="kp-detail-title"
                  className="text-base leading-6 font-semibold text-zinc-900"
                >
                  {detailStep.hardware}
                </p>
                <p className="text-sm leading-5 text-zinc-500">
                  {detailStep.software}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailId(null)}
                aria-label="Close details"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
              >
                <svg
                  viewBox="0 0 12 12"
                  className="h-4 w-4 fill-none stroke-current stroke-[1.4]"
                  aria-hidden="true"
                >
                  <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-600">
              {detailStep.action}
            </p>

            {detailStep.touchesKeys && (
              <span className="mt-3 inline-block rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-yellow-950 uppercase">
                Touches the keys
              </span>
            )}
          </div>
        </div>
      )}
    </figure>
  );
}
