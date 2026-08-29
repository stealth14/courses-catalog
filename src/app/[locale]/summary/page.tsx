import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { StepCard } from "@/components/step-card";
import { Appointment } from "@/models/appointment";
import { getProductCatalog } from "@/lib/product-catalog";
import { Product } from "@/models/product";
import { PaymentHeader } from "../payment/payment-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SummaryPage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const t = await getTranslations("SummaryPage");

  const { product: slugParam, appointment: appointmentParam } =
    await searchParams;
  const productSlug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const appointmentId = Number(
    Array.isArray(appointmentParam) ? appointmentParam[0] : appointmentParam
  );

  const products = await getProductCatalog();
  const product = products.find((item) => item.slug === productSlug);
  const appointment =
    Number.isFinite(appointmentId) && appointmentId > 0
      ? await Appointment.findById(appointmentId)
      : null;

  if (!product || !appointment) {
    redirect({ href: "/shop", locale });
    return null;
  }

  const localized = Product.localize(product, locale);
  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  });
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const capitalize = (value: string) =>
    value.charAt(0).toLocaleUpperCase(locale) + value.slice(1);

  return (
    <StepCard>
      <PaymentHeader variant="compact" />

      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {t("subtitle")}
      </p>

      <div className="overflow-hidden rounded-2xl border border-black/[.08] bg-white shadow-sm dark:border-white/[.145] dark:bg-[#111]">
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </span>
            <span className="min-w-0 flex-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t("appointmentLabel")}
            </span>
            <span className="text-right text-sm font-semibold text-black dark:text-zinc-50">
              {capitalize(
                dateFormatter.format(new Date(`${appointment.date}T12:00:00`))
              )}
              <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {appointment.startTime} – {appointment.endTime}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </span>
            <span className="min-w-0 flex-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t("serviceLabel")}
            </span>
            <span className="text-right text-sm font-semibold text-black dark:text-zinc-50">
              {localized.title}
            </span>
          </div>
        </div>

        <div className="mx-5 border-t border-dashed border-black/[.12] dark:border-white/[.15]" />

        <div className="flex items-center gap-3 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <rect width="20" height="12" x="2" y="6" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
          </span>
          <span className="min-w-0 flex-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {t("totalLabel")}
          </span>
          <span className="text-xl font-bold tracking-tight text-black dark:text-zinc-50">
            {currency.format(product.price)}
          </span>
        </div>
      </div>

      <Link
        href={{
          pathname: "/payment/methods",
          query: { product: product.slug, appointment: String(appointment.id) },
        }}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background shadow-md transition-all hover:bg-[#383838] hover:shadow-lg active:scale-[0.98] dark:hover:bg-[#ccc]"
      >
        {t("confirm")}
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
