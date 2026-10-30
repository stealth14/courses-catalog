import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

/**
 * The key access diagram lives on its own route now. Keep the old URL
 * working by forwarding it there.
 */
export default async function DiagramsPage() {
  const locale = await getLocale();
  redirect({ href: "/diagrams/key-access-diagram", locale });
}
