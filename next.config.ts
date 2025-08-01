import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost", "192.168.20.74", "192.168.20.75"], // ✅ เพิ่ม domain ที่ใช้โหลดรูป
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ppcd.edl.com.la",
        port: "",
      },
      {
        protocol: "https",
        hostname: "api-ppcd.edl.com.la",
        port: "",
      },
    ],
  },
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
