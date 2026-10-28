"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { THEME_STORAGE_KEY } from "@/lib/theme";

type Theme = "light" | "dark";

const THEME_EVENT = "themechange";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function storeTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (e.g. private mode); the class still applies.
  }
}

function hasStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function subscribe(onStoreChange: () => void) {
  // Follow the OS until the visitor makes an explicit choice.
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function handleSystemChange(event: MediaQueryListEvent) {
    if (hasStoredTheme()) return;
    applyTheme(event.matches ? "dark" : "light");
    onStoreChange();
  }

  media.addEventListener("change", handleSystemChange);
  window.addEventListener(THEME_EVENT, onStoreChange);

  return () => {
    media.removeEventListener("change", handleSystemChange);
    window.removeEventListener(THEME_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const t = useTranslations("Layout");
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggleTheme() {
    const theme = getSnapshot() ? "light" : "dark";
    applyTheme(theme);
    storeTheme(theme);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t("themeToggleLabel")}
      aria-pressed={isDark}
      title={t("themeToggleLabel")}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-black/[.05] hover:text-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:text-zinc-400 dark:hover:bg-white/[.08] dark:hover:text-zinc-100"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5 fill-none stroke-current stroke-[1.75] dark:hidden"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="hidden h-5 w-5 fill-none stroke-current stroke-[1.75] dark:block"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </button>
  );
}
