/**
 * Version of the build this code belongs to. `next.config.ts` inlines the same
 * value into the server and browser bundles, so comparing the two reveals
 * whether the page in the browser is still the one being served.
 */
export const APP_VERSION: string = process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown";
