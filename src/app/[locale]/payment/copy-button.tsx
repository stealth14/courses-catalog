"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export function CopyButton({ address }: { address: string }) {
  const t = useTranslations("Common");
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      // Fallback for environments without the async Clipboard API.
      const textarea = document.createElement("textarea");
      textarea.value = address;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    setCopied(true);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={t("copy")}
      className="shrink-0 rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
    >
      {copied ? t("copied") : t("copy")}
    </button>
  );
}
