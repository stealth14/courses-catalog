import type { ReactNode } from "react";

export function PaymentSteps({
  stepsTitle,
  steps,
}: {
  stepsTitle: string;
  steps: ReactNode[];
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-black/[.08] bg-zinc-50 p-4 dark:border-white/[.145] dark:bg-black">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {stepsTitle}
      </span>
      <ol className="flex flex-col gap-2">
        {steps.map((step, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
