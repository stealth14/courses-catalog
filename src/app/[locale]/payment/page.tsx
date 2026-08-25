import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PaymentHeader } from "./payment-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PaymentHub");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function PaymentIndexPage() {
  const t = await getTranslations("PaymentHub");

  return (
    <>
      <PaymentHeader variant="full" />

      <div className="flex flex-col gap-3">
        <Link
          href="/payment/methods"
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
    </>
  );
}
