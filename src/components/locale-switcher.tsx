"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(nextLocale: (typeof routing.locales)[number]) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-1 rounded-full border border-black/[.08] bg-white p-1 text-xs font-medium dark:border-white/[.145] dark:bg-[#111]">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchTo(loc)}
          disabled={isPending || locale === loc}
          className="rounded-full px-3 py-1 uppercase text-zinc-600 transition-colors disabled:opacity-40 enabled:hover:bg-black/[.04] dark:text-zinc-300 dark:enabled:hover:bg-white/[.08]"
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
