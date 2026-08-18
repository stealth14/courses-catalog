import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Allow requests from the phone on the local network during development.
  allowedDevOrigins: ["192.168.1.2"],
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
