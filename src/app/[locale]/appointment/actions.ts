"use server";

import { redirect } from "@/i18n/navigation";
import { getProductCatalog } from "@/lib/product-catalog";

/**
 * Books the selected appointment locally (the selection is already
 * persisted in the zustand booking store) and redirects to the review
 * summary. The appointment record is created in Strapi later, together
 * with the purchase, when the customer continues on WhatsApp.
 */
export async function bookAppointment(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  const productSlug = String(formData.get("productSlug") || "");
  const date = String(formData.get("date") || "");
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");

  const products = await getProductCatalog();
  const product = products.find((item) => item.slug === productSlug);

  if (!product || !date || !startTime || !endTime) {
    redirect({ href: "/shop", locale });
    return;
  }

  redirect({
    href: {
      pathname: "/summary",
      query: { product: product.slug, date, startTime, endTime },
    },
    locale,
  });
}
