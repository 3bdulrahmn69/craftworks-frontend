import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextIntlConfig = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextIntlConfig(nextConfig);
