import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DIAGRAM_TONE_STYLES } from "./diagram-tones";
import { FirmwareThreatDiagram } from "./firmware-threat-diagram";
import { TrezorDiagram } from "./trezor-diagram";
import { TrezorUseCases } from "./trezor-use-cases";

export const metadata: Metadata = {
  title: "Diagram prototype",
  description:
    "Scratch page for prototyping Trezor Safe 5 architecture, use-case and firmware threat-model diagrams.",
  robots: { index: false, follow: false },
};

type LegendItem = {
  /** Complete class list for the swatch chip. */
  swatch: string;
  label: string;
  description: string;
};

const ARCHITECTURE_LEGEND: LegendItem[] = [
  {
    swatch: `h-3 w-3 rounded-full border ${DIAGRAM_TONE_STYLES.amber}`,
    label: "Host",
    description:
      "Trezor Suite on a computer or phone — builds the transaction and broadcasts it.",
  },
  {
    swatch: `h-3 w-3 rounded-full border ${DIAGRAM_TONE_STYLES.neutral}`,
    label: "Device hardware",
    description:
      "Enclosure, touchscreen and the microcontroller that runs the firmware.",
  },
  {
    swatch: `h-3 w-3 rounded-full border ${DIAGRAM_TONE_STYLES.violet}`,
    label: "Firmware",
    description:
      "Open-source image; the device only boots it once its signature is checked.",
  },
  {
    swatch: `h-3 w-3 rounded-full border ${DIAGRAM_TONE_STYLES.emerald}`,
    label: "Security",
    description:
      "Secure element: verifies the firmware signature and guards the PIN.",
  },
  {
    swatch: `h-3 w-3 rounded-full border ${DIAGRAM_TONE_STYLES.sky}`,
    label: "Storage",
    description:
      "Encrypted seed on the device flash — it never leaves the device.",
  },
  {
    swatch:
      "h-3 w-3 rounded-full border border-dashed border-black/[.25] dark:border-white/[.3]",
    label: "Dashed frame",
    description:
      "The Trezor Safe 5 enclosure; everything inside it ships on the device.",
  },
];

const USE_CASE_LEGEND: LegendItem[] = [
  {
    swatch: `h-3 w-3 rounded-full border ${DIAGRAM_TONE_STYLES.amber}`,
    label: "You",
    description:
      "The only actor — every action is approved on the device itself.",
  },
  {
    swatch:
      "h-3 w-6 rounded-full border border-black/[.08] bg-zinc-100 dark:border-white/[.12] dark:bg-white/[.08]",
    label: "Group",
    description:
      "When the interaction happens: set up, everyday use, or upkeep.",
  },
  {
    swatch: `h-3 w-3 rounded-full border ${DIAGRAM_TONE_STYLES.neutral}`,
    label: "Use case",
    description: "One thing you can do, and what it asks of you.",
  },
  {
    swatch:
      "h-3 w-3 rounded-full border border-dashed border-black/[.25] dark:border-white/[.3]",
    label: "Dashed frame",
    description:
      "Trezor Safe 5 plus Trezor Suite: the device and the app it talks to.",
  },
];

function DiagramLegend({
  model,
  items,
}: {
  model: string;
  items: LegendItem[];
}) {
  return (
    <section aria-label="Legend" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Legend
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Model:{" "}
          <span className="font-semibold text-black dark:text-zinc-50">
            {model}
          </span>{" "}
          — USB-C, secure element, color touchscreen.
        </p>
      </div>

      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5">
            <span
              aria-hidden="true"
              className={`mt-1 shrink-0 ${item.swatch}`}
            />
            <span className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-black dark:text-zinc-50">
                {item.label}
              </span>{" "}
              — {item.description}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Scratch route for prototyping a diagram. Intentionally unlinked from the
 * nav and marked `noindex`: the drawing gets iterated on here first, then
 * moves to the page that ships it.
 */
export default async function DummyDiagramPage() {
  const t = await getTranslations("FirmwareDiagram");

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 pt-10 pb-10 sm:px-6 sm:pt-16 sm:pb-16">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-zinc-50">
            Diagram prototype
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Scratch page for iterating on diagram drawings.
          </p>
        </header>

        <section
          aria-labelledby="architecture-heading"
          className="flex flex-col gap-4"
        >
          <h2
            id="architecture-heading"
            className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50"
          >
            Architecture
          </h2>
          <TrezorDiagram />
          <DiagramLegend model="Trezor Safe 5" items={ARCHITECTURE_LEGEND} />
        </section>

        <section
          aria-labelledby="use-cases-heading"
          className="flex flex-col gap-4"
        >
          <h2
            id="use-cases-heading"
            className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50"
          >
            Use cases
          </h2>
          <TrezorUseCases />
          <DiagramLegend model="Trezor Safe 5" items={USE_CASE_LEGEND} />
        </section>

        <section
          aria-labelledby="firmware-heading"
          className="flex flex-col gap-4"
        >
          <h2
            id="firmware-heading"
            className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50"
          >
            {t("sectionTitle")}
          </h2>
          <FirmwareThreatDiagram />
        </section>
      </div>
    </main>
  );
}
