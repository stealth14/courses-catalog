import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
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
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 pt-1 pb-12 font-sans dark:bg-black sm:px-6 sm:py-24">
      <div className="mt-2 flex w-full max-w-md flex-col gap-6 sm:mt-6 sm:rounded-2xl sm:border sm:border-black/[.08] sm:bg-white sm:p-8 sm:dark:border-white/[.145] sm:dark:bg-[#111]">
        <PaymentHeader variant="compact" />

        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>

        <AppointmentCalendar purchaseId={purchase.id} />
      </div>
    </main>
  );
}
