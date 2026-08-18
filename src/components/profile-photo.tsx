"use client";

import Image from "next/image";
import { useState } from "react";

export function ProfilePhoto({ alt }: { alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-foreground text-2xl font-semibold text-background ring-2 ring-black/[.08] dark:ring-white/[.145]"
      >
        RC
      </div>
    );
  }

  return (
    <Image
      src="/profile.jpg"
      alt={alt}
      width={96}
      height={96}
      className="h-24 w-24 rounded-full object-cover ring-2 ring-black/[.08] dark:ring-white/[.145]"
      priority
      onError={() => setFailed(true)}
    />
  );
}
