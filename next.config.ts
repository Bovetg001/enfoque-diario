import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

// Solo aplicar next-pwa en producción para evitar conflicto con Turbopack en dev
if (process.env.NODE_ENV === "production") {
  // @ts-ignore — next-pwa no tiene tipos oficiales para ESM
  const withPWA = require("next-pwa");
  const pwaConfig = withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "offlineCache",
          expiration: { maxEntries: 200 },
        },
      },
    ],
  });
  module.exports = pwaConfig(nextConfig);
} else {
  module.exports = nextConfig;
}
