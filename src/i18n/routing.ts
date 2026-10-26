import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "es"],

  // Used when no locale matches
  defaultLocale: "en",

  // Keep URLs clean: the locale is detected from a cookie or the
  // browser's Accept-Language header instead of living in the path.
  localePrefix: "never",
});
