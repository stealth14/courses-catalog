import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { StepCard } from "@/components/step-card";
import { Appointment } from "@/models/appointment";
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

  const products = await Product.getProducts();
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

  return (
    <StepCard>
      <PaymentHeader variant="compact" />

      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {t("subtitle")}
      </p>

      <div className="flex flex-col gap-3 rounded-2xl border border-black/[.08] p-4 dark:border-white/[.145]">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t("appointmentLabel")}
          </span>
          <span className="text-right text-sm font-semibold text-black dark:text-zinc-50">
            {dateFormatter.format(new Date(`${appointment.date}T12:00:00`))}
            <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {appointment.startTime} – {appointment.endTime}
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-black/[.08] pt-3 dark:border-white/[.145]">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t("serviceLabel")}
          </span>
          <span className="text-right text-sm font-semibold text-black dark:text-zinc-50">
            {localized.title}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-black/[.08] pt-3 dark:border-white/[.145]">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t("priceLabel")}
          </span>
          <span className="text-sm font-semibold text-black dark:text-zinc-50">
            {currency.format(product.price)}
          </span>
        </div>
      </div>

      <Link
        href={{
          pathname: "/payment/methods",
          query: { product: product.slug, appointment: String(appointment.id) },
        }}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        {t("confirm")}
      </Link>
    </StepCard>
  );
}
