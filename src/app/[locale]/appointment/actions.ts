"use server";

import { redirect } from "@/i18n/navigation";
import { Appointment } from "@/models/appointment";
import { Product } from "@/models/product";
import { Purchase } from "@/models/purchase";

/**
 * Books the selected appointment for the purchase and redirects the
 * customer to the wallet page of the chosen payment method.
 */
export async function bookAppointment(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  const purchaseId = Number(formData.get("purchaseId") || NaN);
  const date = String(formData.get("date") || "");
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");

  const purchase = await Purchase.findById(purchaseId);

  if (!purchase || !date || !startTime || !endTime) {
    redirect({ href: "/shop", locale });
    return;
  }

  const appointment = await Appointment.create({ date, startTime, endTime });
  await Purchase.addAppointment(purchase.id, appointment.id);

  const products = await Product.getProducts();
  const product = products.find((item) => item.id === purchase.product);

  redirect({
    href: {
      pathname: `/payment/${purchase.paymentMethod}`,
      query: product ? { product: product.slug } : {},
    },
    locale,
  });
}
