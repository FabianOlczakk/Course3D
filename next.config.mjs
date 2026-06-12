/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Hostinger: wyłącz standalone output żeby uniknąć problemów ze startem
  // output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs", "@prisma/client", "prisma"],
  },
};

export default nextConfig;
