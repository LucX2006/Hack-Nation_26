/** @type {import('next').NextConfig} */
const nextConfig = {
  // Completely disable development indicators
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
