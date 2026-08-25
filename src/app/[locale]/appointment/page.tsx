import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { StepCard } from "@/components/step-card";
import { Purchase } from "@/models/purchase";
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

  const { purchase: purchaseParam } = await searchParams;
  const purchaseId = Number(
    Array.isArray(purchaseParam) ? purchaseParam[0] : purchaseParam
  );

  const purchase =
    Number.isFinite(purchaseId) && purchaseId > 0
      ? await Purchase.findById(purchaseId)
      : null;

  if (!purchase) {
    redirect({ href: "/shop", locale });
    return null;
  }

  return (
    <StepCard>
      <PaymentHeader variant="compact" />

      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {t("subtitle")}
      </p>

      <AppointmentCalendar purchaseId={purchase.id} />
    </StepCard>
  );
}
