import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * The CMS serves post media from its own origin (e.g. `/uploads/post.png`),
 * so `next/image` needs that origin allowed as a remote pattern.
 */
function cmsImages(): Pick<NextConfig, "images"> {
  if (!apiUrl) return {};

  try {
    const { protocol, host, pathname } = new URL(apiUrl);
    const basePath = pathname.replace(/\/+$/, "");
    return { images: { remotePatterns: [new URL(`${protocol}//${host}${basePath}/**`)] } };
  } catch {
    return {};
  }
}

const nextConfig: NextConfig = {
  // Allow requests from the phone on the local network during development.
  allowedDevOrigins: ["192.168.1.2"],
  ...cmsImages(),
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
