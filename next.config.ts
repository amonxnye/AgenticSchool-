import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // App Hosting provides FIREBASE_WEBAPP_CONFIG at build time only; inline it for the browser.
    NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG:
      process.env.FIREBASE_WEBAPP_CONFIG ?? process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG ?? "",
  },
};

export default nextConfig;
