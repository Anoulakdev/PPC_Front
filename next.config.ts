import type { NextConfig } from "next";

const nextConfig = {
  serverExternalPackages: ["puppeteer"],
  productionBrowserSourceMaps: false,
  typescript: {
    // ข้ามการตรวจ Type ตอน build บน server เพื่อประหยัด RAM (ตรวจผ่านแล้วบน Mac)
    ignoreBuildErrors: true,
  },
  eslint: {
    // ข้ามการรัน Lint ตอน build บน server เพื่อประหยัด RAM
    ignoreDuringBuilds: true,
  },
  experimental: {
    webpackBuildWorker: true, // สำคัญมาก: บังคับให้ Webpack คืน RAM ทันทีที่ทำงานเสร็จ
    webpackMemoryOptimizations: true,
    cpus: 1,
    optimizePackageImports: [
      "@heroicons/react",
      "apexcharts",
      "chart.js",
      "framer-motion",
      "moment",
      "xlsx",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "192.168.20.74" },
      { protocol: "http", hostname: "192.168.20.75" },
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

export default nextConfig;
