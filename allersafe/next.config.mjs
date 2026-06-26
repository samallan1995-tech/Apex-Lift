/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // @react-pdf/renderer needs canvas for server rendering
      config.externals = [...(config.externals ?? []), 'canvas'];
    }
    return config;
  },
};

export default nextConfig;
