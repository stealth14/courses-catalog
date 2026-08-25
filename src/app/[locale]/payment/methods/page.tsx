import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { Product } from "@/models/product";
import { PaymentHeader } from "../payment-header";
import { createPurchase } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PaymentHub");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

const METHOD_CARD_CLASS =
  "group flex w-full items-center gap-4 rounded-2xl border border-black/[.08] p-4 text-left transition-all hover:border-black/[.15] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.99] dark:border-white/[.145] dark:hover:border-white/[.25] sm:p-5";

function MethodChevron() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 fill-current text-zinc-400 transition-transform group-hover:translate-x-0.5"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default async function PaymentMethodsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const t = await getTranslations("PaymentHub");
  const th = await getTranslations("PaymentHeader");

  const { product: slugParam } = await searchParams;
  const productSlug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  const products = await Product.getProducts();
  const product = products.find((item) => item.slug === productSlug);

  if (!product) {
    redirect({ href: "/shop", locale });
    return null;
  }

  const localized = Product.localize(product, locale);
  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  });

  return (
    <>
      <PaymentHeader variant="compact" />

      <div className="flex flex-col gap-3">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>

        <p className="rounded-xl border border-black/[.08] bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-600 dark:border-white/[.145] dark:bg-black dark:text-zinc-300">
          {t("purchasingLabel")}{" "}
          <strong className="font-semibold text-black dark:text-zinc-50">
            {localized.title}
          </strong>{" "}
          · {currency.format(product.price)}
        </p>

        <form action={createPurchase}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="productSlug" value={product.slug} />
          <input type="hidden" name="method" value="usdt" />
          <button type="submit" className={METHOD_CARD_CLASS}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-emerald-600 dark:bg-white/[.08] dark:text-emerald-400">
              ₮
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-black dark:text-zinc-50">
                {th("methodUsdt")}
              </span>
              <span className="block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                {t("methodUsdtDesc")}
              </span>
            </span>
            <MethodChevron />
          </button>
        </form>

        <form action={createPurchase}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="productSlug" value={product.slug} />
          <input type="hidden" name="method" value="btc" />
          <button type="submit" className={METHOD_CARD_CLASS}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-[#F7931A] dark:bg-white/[.08]">
              ₿
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-black dark:text-zinc-50">
                {th("methodBtc")}
              </span>
              <span className="block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                {t("methodBtcDesc")}
              </span>
            </span>
            <MethodChevron />
          </button>
        </form>

        <form action={createPurchase}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="productSlug" value={product.slug} />
          <input type="hidden" name="method" value="whatsapp" />
          <button type="submit" className={METHOD_CARD_CLASS}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-[#25D366] dark:bg-white/[.08]">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 fill-current"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-black dark:text-zinc-50">
                {th("methodWhatsapp")}
              </span>
              <span className="block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                {t("methodWhatsappDesc")}
              </span>
            </span>
            <MethodChevron />
          </button>
        </form>

        {/* TODO: Re-enable the Binance payment option when ready.
        <form action={createPurchase}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="productSlug" value={product.slug} />
          <input type="hidden" name="method" value="binance" />
          <button type="submit" className={METHOD_CARD_CLASS}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-[#F0B90B] dark:bg-white/[.08]">
              B
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-black dark:text-zinc-50">
                {th("methodBinance")}
              </span>
              <span className="block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                {t("methodBinanceDesc")}
              </span>
            </span>
            <MethodChevron />
          </button>
        </form>
        */}
      </div>
    </>
  );
}
