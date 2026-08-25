import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PaymentHeader } from "./payment/payment-header";

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 pt-1 pb-12 font-sans dark:bg-black sm:px-6 sm:py-24">
      <div className="mt-2 flex w-full max-w-md flex-col gap-6 sm:mt-6 sm:rounded-2xl sm:border sm:border-black/[.08] sm:bg-white sm:p-8 sm:dark:border-white/[.145] sm:dark:bg-[#111]">
        <PaymentHeader variant="full" />

        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("intro")}
        </p>

        <Link
          href="/shop"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          {t("cta")}
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="h-4 w-4 fill-current"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </main>
  );
}
