import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: !isProd,
});

const nextConfig = {
  images: {
    domains: ["localhost", "192.168.20.74", "192.168.20.75"],
    remotePatterns: [
      { protocol: "https", hostname: "ppcd.edl.com.la" },
      { protocol: "https", hostname: "api-ppcd.edl.com.la" },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
} satisfies NextConfig;

export default withPWA(nextConfig);
