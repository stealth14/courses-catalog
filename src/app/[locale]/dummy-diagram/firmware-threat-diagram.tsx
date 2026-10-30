"use client";

import { useState, type ComponentType } from "react";
import { useTranslations } from "next-intl";
import {
  DatabaseIcon,
  DiceIcon,
  DisplayIcon,
  FirmwareChipIcon,
  KeyIcon,
  KeypadIcon,
  ShieldIcon,
  TapIcon,
  UsbIcon,
  WarningIcon,
  type FirmwareIconProps,
} from "@/components/icons/firmware-icons";

type FirmwareTarget = {
  id:
    | "display"
    | "touch"
    | "usb"
    | "seed"
    | "passphrase"
    | "storage"
    | "secure-element"
    | "randomness";
  icon: ComponentType<FirmwareIconProps>;
};

const TARGETS: FirmwareTarget[] = [
  { id: "display", icon: DisplayIcon },
  { id: "touch", icon: TapIcon },
  { id: "usb", icon: UsbIcon },
  { id: "seed", icon: KeyIcon },
  { id: "passphrase", icon: KeypadIcon },
  { id: "storage", icon: DatabaseIcon },
  { id: "secure-element", icon: ShieldIcon },
  { id: "randomness", icon: DiceIcon },
];

/** Angles in degrees for a regular octagon ring: top-left, top, top-right, left, right, bottom-left, bottom, bottom-right. */
const RING_ANGLES = [-135, -90, -45, 180, 0, 135, 90, 45];

/** Ring geometry, as percentages of the square diagram box. */
const RING_RADIUS = 36.5;
const TILE_SIZE = 25;
const HUB_SIZE = 26;

const HUB = { x: 50, y: 50 };

function ringPosition(index: number) {
  const radians = ((RING_ANGLES[index] ?? 0) * Math.PI) / 180;

  return {
    x: HUB.x + RING_RADIUS * Math.cos(radians),
    y: HUB.y + RING_RADIUS * Math.sin(radians),
  };
}

function SpokeLines({ selectedId }: { selectedId: string | null }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {TARGETS.map((target, index) => {
        const isSelected = target.id === selectedId;
        const dimmed = selectedId !== null && !isSelected;
        const end = ringPosition(index);

        return (
          <line
            key={target.id}
            x1={HUB.x}
            y1={HUB.y}
            x2={end.x}
            y2={end.y}
            strokeWidth={isSelected ? 3 : 1}
            strokeDasharray={isSelected ? "1 5" : "2 6"}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={
              isSelected
                ? "stroke-rose-600"
                : dimmed
                  ? "stroke-zinc-400 opacity-60"
                  : "stroke-zinc-400"
            }
            style={
              isSelected
                ? { animation: "fw-flow 0.45s linear infinite" }
                : undefined
            }
          />
        );
      })}
    </svg>
  );
}

function FirmwareHub() {
  const t = useTranslations("FirmwareDiagram");

  return (
    <div className="relative w-full aspect-square flex select-none flex-col items-center justify-center gap-1.5 rounded-full border border-rose-900/30 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 p-3 text-center text-white shadow-lg shadow-rose-900/25 ring-1 ring-white/20 ring-inset">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
        <FirmwareChipIcon className="h-5 w-5 text-white" />
      </span>
      <p className="text-xs leading-4 font-semibold tracking-tight text-white">
        {t("hubTitle")}
      </p>
    </div>
  );
}

/**
 * Threat-model diagram: a compromised firmware image sits at the centre and
 * every element it could reach is one click away from a plain-language
 * explanation. Kept local to the prototype route on purpose.
 */
export function FirmwareThreatDiagram() {
  const t = useTranslations("FirmwareDiagram");
  const [selectedId, setSelectedId] = useState<FirmwareTarget["id"] | null>(
    null,
  );
  const selected = TARGETS.find((target) => target.id === selectedId) ?? null;
  const SelectedIcon = selected?.icon;

  return (
    <figure className="flex flex-col gap-3 rounded-3xl bg-white p-3 text-zinc-900 [color-scheme:light] sm:p-4">
      <style>{`
        @keyframes fw-flow {
          to { stroke-dashoffset: -12; }
        }
        @keyframes fw-infected-pulse {
          0%, 100% {
            opacity: 0.25;
          }
          50% {
            opacity: 1;
          }
        }
        .fw-infected-tile::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow: 0 0 14px 5px rgb(190 18 60 / 70%);
          opacity: 0.25;
          pointer-events: none;
          animation: fw-infected-pulse 1.2s ease-in-out infinite;
          will-change: opacity;
        }
        .fw-infected-tile::after { z-index: 0; }
        @media (prefers-reduced-motion: reduce) {
          .fw-infected-tile::after {
            animation-duration: 2.4s;
          }
        }
      `}</style>

      <div className="order-2 rounded-3xl border border-dashed border-black/[.14] p-4 sm:p-5 md:order-1">
        <div className="mb-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <WarningIcon className="h-4 w-4 self-center text-rose-600" />
          <p className="text-sm font-semibold tracking-tight text-black">
            {t("device")}
          </p>
          <p className="text-xs text-zinc-500">
            {t("model")}
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="mx-auto w-[27rem] pb-3 pt-4 md:w-full md:max-w-[30rem]">
            <div className="relative aspect-square w-full select-none">
              <SpokeLines selectedId={selectedId} />

              {TARGETS.map((target, index) => {
                const { x, y } = ringPosition(index);

                return (
                  <div
                    key={target.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${TILE_SIZE}%`,
                    }}
                  >
                    <TargetTile
                      target={target}
                      short={t(`targets.${target.id}.short`)}
                      selected={selectedId === target.id}
                      onSelect={setSelectedId}
                    />
                  </div>
                );
              })}

              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ width: `${HUB_SIZE}%` }}
              >
                <FirmwareHub />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="order-1 min-h-[7.5rem] rounded-2xl border border-black/[.08] bg-zinc-50 p-4 sm:p-5 md:order-2"
      >
        {selected && SelectedIcon ? (
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-50 text-rose-600">
              <SelectedIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg leading-6 font-semibold tracking-tight text-black">
                {t(`targets.${selected.id}.name`)}
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                {t(`targets.${selected.id}.description`)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-zinc-500">{t("prompt")}</p>
        )}
      </div>

      <figcaption className="order-3 text-xs leading-5 text-zinc-500">
        {t("caption")}
      </figcaption>
    </figure>
  );
}

function TargetTile({
  target,
  short,
  selected,
  onSelect,
}: {
  target: FirmwareTarget;
  short: string;
  selected: boolean;
  onSelect: (id: FirmwareTarget["id"] | null) => void;
}) {
  const Icon = target.icon;

  return (
    <button
      type="button"
      aria-label={short}
      aria-pressed={selected}
      onClick={() => onSelect(selected ? null : target.id)}
      className={`relative w-full aspect-square flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-full border px-1 py-2 text-center transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
        selected
          ? "fw-infected-tile isolate border-rose-700 bg-rose-100 text-rose-950"
          : "border-zinc-300 bg-white text-black hover:border-zinc-500"
      }`}
    >
      <span
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          selected
            ? "bg-rose-200 text-rose-900"
            : "bg-zinc-100 text-zinc-600"
        }`}
      >
        <Icon
          className="relative z-10 h-5 w-5"
          strokeWidth={selected ? 2.4 : 1.6}
        />
      </span>
      <span className="relative z-10 line-clamp-2 w-full break-words text-xs leading-4 font-semibold">
        {short}
      </span>
    </button>
  );
}
