"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { APP_VERSION } from "@/lib/app-version";

const VERSION_ENDPOINT = "/api/version";

/** How often an open tab asks whether a newer deployment went live. */
const POLL_INTERVAL_MS = 60_000;

/**
 * Marks the server version this tab already reloaded for, so a deployment that
 * keeps reporting a mismatch (e.g. CDN still serving the old bundle) cannot
 * trap the visitor in a reload loop.
 */
const RELOAD_GUARD_KEY = "app-version-reloaded-for";

function readReloadGuard(): string | null {
  try {
    return window.sessionStorage.getItem(RELOAD_GUARD_KEY);
  } catch {
    return null;
  }
}

function writeReloadGuard(version: string | null) {
  try {
    if (version === null) window.sessionStorage.removeItem(RELOAD_GUARD_KEY);
    else window.sessionStorage.setItem(RELOAD_GUARD_KEY, version);
  } catch {
    // Storage can be unavailable (e.g. private mode); polling still works.
  }
}

/**
 * Keeps the running page in step with the live deployment: polls
 * `/api/version` and hard-reloads when the server reports a different build,
 * so nobody keeps clicking through UI from an outdated version. The blocking
 * overlay covers the reload so stale controls cannot be used in the meantime.
 */
export function VersionWatcher() {
  const t = useTranslations("Layout");
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    let inFlight: AbortController | null = null;

    async function checkVersion() {
      // Hidden tabs would only spend requests; they re-check when visible.
      if (!isSubscribed || document.visibilityState === "hidden") return;
      if (navigator.onLine === false) return;

      inFlight?.abort();
      const controller = new AbortController();
      inFlight = controller;

      try {
        const response = await fetch(VERSION_ENDPOINT, {
          cache: "no-store",
          headers: { accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok || !isSubscribed) return;

        const { version } = (await response.json()) as { version?: unknown };
        if (typeof version !== "string" || version === APP_VERSION) {
          // Up to date: allow a future deployment to trigger another reload.
          writeReloadGuard(null);
          return;
        }

        if (readReloadGuard() === version) {
          console.warn(
            `Stale UI: server runs ${version}, this tab runs ${APP_VERSION}.`
          );
          return;
        }

        writeReloadGuard(version);
        setIsReloading(true);
        // Let the overlay paint before the browser tears the page down.
        requestAnimationFrame(() => window.location.reload());
      } catch {
        // Offline, aborted, or an unreadable response: retry on the next tick.
      }
    }

    function checkWhenVisible() {
      if (document.visibilityState === "visible") void checkVersion();
    }

    void checkVersion();
    const interval = window.setInterval(() => void checkVersion(), POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", checkWhenVisible);
    window.addEventListener("pageshow", checkVersion);
    window.addEventListener("online", checkVersion);

    return () => {
      isSubscribed = false;
      inFlight?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", checkWhenVisible);
      window.removeEventListener("pageshow", checkVersion);
      window.removeEventListener("online", checkVersion);
    };
  }, []);

  if (!isReloading) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-zinc-50/95 backdrop-blur-sm dark:bg-black/95"
    >
      <span
        aria-hidden="true"
        className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-200"
      />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {t("versionUpdateLabel")}
      </p>
    </div>
  );
}
