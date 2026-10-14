"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { LearningLinks } from "./learning-links";

/**
 * Header calls to action. On the landing page, keep them in the header only
 * after the hero has scrolled out of view.
 */
export function SiteNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [heroVisibility, setHeroVisibility] = useState({
    pathname,
    visible: true,
  });

  if (heroVisibility.pathname !== pathname) {
    setHeroVisibility({ pathname, visible: true });
  }

  useEffect(() => {
    if (pathname !== "/") return;

    const hero = document.getElementById("home-hero");
    if (!hero) return;

    const header = document.querySelector("header");
    const headerHeight =
      header instanceof HTMLElement
        ? Math.ceil(header.getBoundingClientRect().height)
        : 0;
    const observer = new IntersectionObserver(([entry]) => {
      setHeroVisibility((current) =>
        current.pathname === pathname
          ? { pathname, visible: entry.isIntersecting }
          : current
      );
    }, { rootMargin: `-${headerHeight}px 0px 0px 0px` });
    observer.observe(hero);

    return () => observer.disconnect();
  }, [pathname]);

  const showNavLinks =
    pathname !== "/" ||
    (heroVisibility.pathname === pathname && !heroVisibility.visible);

  return showNavLinks ? (
    <nav aria-label={t("label")}>
      <LearningLinks size="nav" />
    </nav>
  ) : null;
}
