import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextIntlConfig = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
    ],
  },
};

export default nextIntlConfig(nextConfig);
