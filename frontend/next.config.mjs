/** @type {import('next').NextConfig} */
const nextConfig = {
  // Completely disable development indicators
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
