import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@creit.tech/stellar-wallets-kit", "contract"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
