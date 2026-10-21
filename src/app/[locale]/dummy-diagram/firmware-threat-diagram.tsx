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
} from "./firmware-icons";

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
  /** Where the spoke from the firmware hub ends, in percent. */
  spoke: { x: number; y: number };
};

/**
 * Reading order is also the grid order: interface on top, secrets on the
 * sides, internals at the bottom. The hub itself is rendered between the
 * second and third row.
 */
const TARGETS: FirmwareTarget[] = [
  {
    id: "display",
    icon: DisplayIcon,
    spoke: { x: 16.5, y: 16.5 },
  },
  {
    id: "touch",
    icon: TapIcon,
    spoke: { x: 50, y: 14 },
  },
  {
    id: "usb",
    icon: UsbIcon,
    spoke: { x: 83.5, y: 16.5 },
  },
  {
    id: "seed",
    icon: KeyIcon,
    spoke: { x: 16.5, y: 50 },
  },
  {
    id: "passphrase",
    icon: KeypadIcon,
    spoke: { x: 83.5, y: 50 },
  },
  {
    id: "storage",
    icon: DatabaseIcon,
    spoke: { x: 16.5, y: 84 },
  },
  {
    id: "secure-element",
    icon: ShieldIcon,
    spoke: { x: 50, y: 86 },
  },
  {
    id: "randomness",
    icon: DiceIcon,
    spoke: { x: 83.5, y: 84 },
  },
];

const HUB = { x: 50, y: 50 };

function SpokeLines({ selectedId }: { selectedId: string | null }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {TARGETS.map((target) => {
        const isSelected = target.id === selectedId;
        const dimmed = selectedId !== null && !isSelected;

        return (
          <line
            key={target.id}
            x1={HUB.x}
            y1={HUB.y}
            x2={target.spoke.x}
            y2={target.spoke.y}
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
    <div className="relative w-full min-h-0 self-start aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-50 p-2 text-center">
      <FirmwareChipIcon className="h-8 w-8 shrink-0 text-rose-600" />
      <p className="text-xs leading-4 font-semibold tracking-tight text-rose-900">
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
          <div className="mx-auto w-[24rem] pb-3 pt-4 md:w-full md:max-w-[26rem]">
            <div className="relative grid grid-cols-3 gap-8">
              <SpokeLines selectedId={selectedId} />

              {/* Split around the hub so it lands in the centre cell. */}
              {TARGETS.slice(0, 4).map((target) => (
                <TargetTile
                  key={target.id}
                  target={target}
                  short={t(`targets.${target.id}.short`)}
                  selected={selectedId === target.id}
                  onSelect={setSelectedId}
                />
              ))}

              <FirmwareHub />

              {TARGETS.slice(4).map((target) => (
                <TargetTile
                  key={target.id}
                  target={target}
                  short={t(`targets.${target.id}.short`)}
                  selected={selectedId === target.id}
                  onSelect={setSelectedId}
                />
              ))}
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
      className={`relative w-full min-h-0 self-start aspect-square flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border p-2 text-center transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
        selected
          ? "fw-infected-tile isolate border-rose-700 bg-rose-100 text-rose-950"
          : "border-zinc-300 bg-white text-black hover:border-zinc-500"
      }`}
    >
      <span
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
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
