import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      {
        source: "/products/thym-honey",
        destination: "/products/saatar-honey",
        permanent: true,
      },
      {
        source: "/products/thym-honey-:size",
        destination: "/products/saatar-honey-:size",
        permanent: true,
      },
      {
        source: "/products/peanut-amlou",
        destination: "/products/cocoa-amlou",
        permanent: true,
      },
      {
        source: "/products/peanut-amlou-:size",
        destination: "/products/cocoa-amlou-:size",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
