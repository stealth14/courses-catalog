import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FirmwareThreatDiagram } from "./firmware-threat-diagram";

export const metadata: Metadata = {
  title: "Diagram prototype",
  description:
    "Scratch page for prototyping the Trezor Safe 5 firmware threat-model diagram.",
  robots: { index: false, follow: false },
};

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
