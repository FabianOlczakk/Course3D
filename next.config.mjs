/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["framer-motion"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs", "@prisma/client", "prisma"],
  },
  // Wyłącz telemetrię
  env: {
    NEXT_TELEMETRY_DISABLED: "1",
  },
};

export default nextConfig;
