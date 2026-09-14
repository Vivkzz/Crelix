import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-aee1bbd8-372b-44cc-9251-fcb565f97170.space-z.ai",
    "*.space-z.ai",
  ],
};

export default nextConfig;
