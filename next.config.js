/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
  // Playwright and its CDP/BiDi deps reach into native Node APIs that webpack
  // can't trace. Keep it out of the bundle and let Node resolve it at runtime.
  experimental: {
    serverComponentsExternalPackages: ["playwright-core", "chromium-bidi"],
  },
};

module.exports = nextConfig;
