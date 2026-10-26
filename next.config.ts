import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  /* one canonical host: send the bare domain and the previous domain to
     www.crelixai.com, keeping the path, so old links and rankings carry over */
  async redirects() {
    const canonical = "https://www.crelixai.com";
    return ["crelixai.com", "ekamai.in", "www.ekamai.in"].map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${canonical}/:path*`,
      permanent: true,
    }));
  },
  allowedDevOrigins: [
    "preview-chat-aee1bbd8-372b-44cc-9251-fcb565f97170.space-z.ai",
    "*.space-z.ai",
  ],
};

export default nextConfig;
