import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
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
      {
        source: "/products/amlou-royal",
        destination: "/amlouroyal",
        permanent: true,
      },
      {
        source: "/products/amlou-royal-:size",
        destination: "/amlouroyal",
        permanent: true,
      },
      // Google Ads display path cosmetic URL → shop catalog
      {
        source: "/amlou/order",
        destination: "/products",
        permanent: false,
      },
      {
        source: "/fr/amlou/order",
        destination: "/fr/products",
        permanent: false,
      },
      {
        source: "/en/amlou/order",
        destination: "/en/products",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
