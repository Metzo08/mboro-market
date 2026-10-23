import type { NextConfig } from "next";
import { resolveBackendOrigin } from "./src/lib/apiBase";

const backendOrigin = resolveBackendOrigin();

const nextConfig: NextConfig = {
  /*
   * Filet de sécurité : même si NEXT_PUBLIC_API_URL vaut `/api` (ou est absent),
   * les appels du navigateur sont proxifiés vers NestJS au lieu de renvoyer 404.
   */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
