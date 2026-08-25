import type { ReactNode } from "react";

/**
 * Standard card every flow page renders its content in.
 *
 * Fixed width and height on desktop (sm+) and fixed viewport height on
 * mobile, so the card never expands or shrinks when the user moves
 * between steps of the flow — the content scrolls vertically inside
 * instead.
 */
export function StepCard({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-2 font-sans dark:bg-black sm:px-6 sm:py-12">
      <div className="flex h-[calc(100dvh-64px)] w-full max-w-md flex-col gap-6 overflow-y-auto p-1 sm:h-[672px] sm:w-[432px] sm:shrink-0 sm:rounded-2xl sm:border sm:border-black/[.08] sm:bg-white sm:p-8 sm:dark:border-white/[.145] sm:dark:bg-[#111]">
        {children}
      </div>
    </main>
  );
}
