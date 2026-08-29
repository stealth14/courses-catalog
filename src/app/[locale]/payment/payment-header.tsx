import { getLocale, getTranslations } from "next-intl/server";
import { getProfileTitles } from "@/lib/profile-titles";
import { ProfilePhoto } from "@/components/profile-photo";

const PROFILE_NAME = "Ronny Cajas";
const LINKEDIN_URL = "https://www.linkedin.com/in/ronny-cajas-089812176/";

export async function PaymentHeader({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  const t = await getTranslations("PaymentHeader");
  const locale = await getLocale();
  const profileTitles = await getProfileTitles(locale);

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3">
        <ProfilePhoto alt={t("photoAlt")} size="compact" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold tracking-tight text-black dark:text-zinc-50">
            {PROFILE_NAME}
          </p>
          <p className="text-xs font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
            {t.rich("roleSelfCustody", {
              btc: (chunks) => (
                <span className="font-semibold text-[#F7931A]">{chunks}</span>
              ),
            })}
          </p>
        </div>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("linkedinLabel")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/[.08] text-zinc-600 transition-colors hover:bg-black/[.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:border-white/[.145] dark:text-zinc-300 dark:hover:bg-white/[.06]"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4 fill-current"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <ProfilePhoto alt={t("photoAlt")} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {PROFILE_NAME}
        </h1>
        <div className="mt-5 flex flex-col items-center">
          <div
            aria-hidden="true"
            className="mb-4 h-px w-12 bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-600"
          />
          <h2 className="flex items-center gap-1.5 text-[15px] leading-6 text-zinc-700 dark:text-zinc-200">
            <span
              aria-hidden="true"
              className="text-base font-semibold text-[#F7931A]"
            >
              ₿
            </span>
            <span className="font-medium tracking-wide">
              {t.rich("roleSelfCustody", {
                btc: (chunks) => (
                  <span className="font-semibold text-[#F7931A]">
                    {chunks}
                  </span>
                ),
              })}
            </span>
          </h2>
          <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            {profileTitles.map((title, index) => (
              <span key={title} className="flex items-center gap-2">
                {index > 0 ? (
                  <span
                    aria-hidden="true"
                    className="h-0.5 w-0.5 rounded-full bg-zinc-400 dark:bg-zinc-600"
                  />
                ) : null}
                <span>{title}</span>
              </span>
            ))}
          </p>
        </div>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("linkedinLabel")}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-white/[.06]"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4 fill-current"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
          </svg>
          LinkedIn
        </a>
      </div>
    </div>
  );
}
