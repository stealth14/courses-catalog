"use client";

import Image from "next/image";
import { useState } from "react";

const SIZES = {
  full: { box: "h-24 w-24", text: "text-2xl", dims: 96 },
  compact: { box: "h-12 w-12", text: "text-sm", dims: 48 },
} as const;

export function ProfilePhoto({
  alt,
  size = "full",
}: {
  alt: string;
  size?: keyof typeof SIZES;
}) {
  const [failed, setFailed] = useState(false);
  const s = SIZES[size];

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex ${s.box} shrink-0 items-center justify-center rounded-full bg-foreground ${s.text} font-semibold text-background ring-2 ring-black/[.08] dark:ring-white/[.145]`}
      >
        RC
      </div>
    );
  }

  return (
    <Image
      src="/profile.jpg"
      alt={alt}
      width={s.dims}
      height={s.dims}
      className={`${s.box} shrink-0 rounded-full object-cover ring-2 ring-black/[.08] dark:ring-white/[.145]`}
      priority
      onError={() => setFailed(true)}
    />
  );
}
