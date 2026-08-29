"use server";

import { redirect } from "@/i18n/navigation";
import { Appointment } from "@/models/appointment";
import { getProductCatalog } from "@/lib/product-catalog";

/**
 * Books the selected appointment and redirects the customer to the
 * payment method selection.
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

  const appointment = await Appointment.create({ date, startTime, endTime });

  redirect({
    href: {
      pathname: "/summary",
      query: { product: product.slug, appointment: String(appointment.id) },
    },
    locale,
  });
}
