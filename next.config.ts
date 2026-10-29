import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Identity of the running build, inlined into both the server and the browser
 * bundles. It must change whenever the served code changes — a deployment, or
 * a `next dev` restart — because the browser polls `/api/version` and reloads
 * itself when the value no longer matches the one it was compiled with, so a
 * tab never keeps running UI from an older build.
 */
function resolveAppVersion(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_VERSION;
  if (explicit) return explicit;

  // Vercel changes this on every deployment, including redeploys of the same
  // commit, so open tabs refresh whenever a new build goes live.
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID;
  if (deploymentId) return deploymentId;

  const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA;
  if (commit) return commit.slice(0, 12);

  // A fresh stamp per build and per dev-server start: restarting `next dev`
  // makes already-open tabs reload themselves instead of running stale code.
  return Date.now().toString(36);
}

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
  env: { NEXT_PUBLIC_APP_VERSION: resolveAppVersion() },
  ...cmsImages(),
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
