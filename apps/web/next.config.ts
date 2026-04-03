import type { NextConfig } from "next";

const laravelBackend =
  process.env.LARAVEL_BACKEND_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${laravelBackend.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
