import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { StepCard } from "@/components/step-card";
import { PaymentHeader } from "./payment/payment-header";

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <StepCard>
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
    </StepCard>
  );
}
