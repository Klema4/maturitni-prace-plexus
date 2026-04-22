import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    // Removed redirects for /ads/* paths to avoid automatic redirects from
    // legacy /ads/dashboard URLs. If you need redirects in the future, add
    // explicit rules here that do not point from /ads/*.
    return [];
  },
  images: {
    localPatterns: [
      {
        pathname: "/api/dashboard/storage/file",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.adam-klement.cz",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "maturita-cdn.adam-klement.cz",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "maturita-cdn.adam-klement.cz",
        port: "9007",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "maturita-cdn.adam-klement.cz",
        port: "9007",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
