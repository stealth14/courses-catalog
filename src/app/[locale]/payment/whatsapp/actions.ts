"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { redirect as localizedRedirect } from "@/i18n/navigation";
import { getProductCatalog } from "@/lib/product-catalog";
import { getPaymentAddresses } from "@/lib/payment-addresses";
import { Product } from "@/models/product";
import { Appointment } from "@/models/appointment";
import { PaymentMethod, Purchase } from "@/models/purchase";

/**
 * Creates the appointment and purchase records (Strapi) at the same time
 * and redirects the customer to the WhatsApp app, right before the chat
 * opens.
 */
export async function continueOnWhatsapp(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  const productSlug = String(formData.get("productSlug") || "");
  const date = String(formData.get("date") || "");
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");
  const hasAppointment = Boolean(date && startTime && endTime);

  const products = await getProductCatalog();
  const product = products.find((item) => item.slug === productSlug);

  if (!product) {
    localizedRedirect({ href: "/shop", locale });
    return;
  }

  const t = await getTranslations({ locale, namespace: "WhatsappPage" });
  const { whatsapp } = await getPaymentAddresses();

  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  });

  const template = t("template", {
    product: Product.localize(product, locale).title,
    price: currency.format(product.price),
  });

  // Strapi v5 REST does not support nested entry creation on a single
  // POST: create the appointment first, then connect it to the purchase.
  const appointment = hasAppointment
    ? await Appointment.create({ date, startTime, endTime })
    : null;

  await Purchase.create({
    paymentMethod: PaymentMethod.WHATSAPP,
    product: product.id,
    appointment: appointment?.documentId ?? null,
  });

  redirect(
    `https://wa.me/${whatsapp.phone}?text=${encodeURIComponent(template)}`
  );
}
