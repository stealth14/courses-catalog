import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { StepCard } from "@/components/step-card";
import { Product } from "@/models/product";
import { PaymentHeader } from "../payment/payment-header";
import { AppointmentCalendar } from "./appointment-calendar";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AppointmentPage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function AppointmentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const t = await getTranslations("AppointmentPage");
  const th = await getTranslations("PaymentHub");

  const { product: slugParam } = await searchParams;
  const productSlug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  const products = await Product.getProducts();
  const product = products.find((item) => item.slug === productSlug);

  if (!product) {
    redirect({ href: "/shop", locale });
    return null;
  }

  const localized = Product.localize(product, locale);

  return (
    <StepCard>
      <div className="hidden sm:block">
        <PaymentHeader variant="compact" />
      </div>

      <p className="rounded-xl border border-black/[.08] bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-600 dark:border-white/[.145] dark:bg-black dark:text-zinc-300">
        {th("bookingLabel")}{" "}
        <strong className="font-semibold text-black dark:text-zinc-50">
          {localized.title}
        </strong>
      </p>

      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {t("subtitle")}
      </p>

      <AppointmentCalendar productSlug={product.slug} />
    </StepCard>
  );
}
