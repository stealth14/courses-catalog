"use server";

import { redirect } from "@/i18n/navigation";
import { getProductCatalog } from "@/lib/product-catalog";
import { PaymentMethod, Purchase } from "@/models/purchase";

const PAYMENT_METHODS = Object.values(PaymentMethod);

/**
 * Creates a purchase record locally and redirects the customer to the
 * wallet page of the selected payment method.
 */
export async function createPurchase(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  const method = String(formData.get("method") || "");
  const productSlug = String(formData.get("productSlug") || "");

  if (!PAYMENT_METHODS.includes(method as PaymentMethod)) {
    redirect({ href: "/shop", locale });
    return;
  }

  const products = await getProductCatalog();
  const product = products.find((item) => item.slug === productSlug);

  if (!product) {
    redirect({ href: "/shop", locale });
    return;
  }

  const appointmentParam = Number(formData.get("appointment") || NaN);
  const appointmentId =
    Number.isFinite(appointmentParam) && appointmentParam > 0
      ? appointmentParam
      : null;

  await Purchase.create({
    paymentMethod: method as PaymentMethod,
    product: product.id,
    appointment: appointmentId,
  });

  redirect({
    href: {
      pathname: `/payment/${method}`,
      query: { product: productSlug },
    },
    locale,
  });
}
