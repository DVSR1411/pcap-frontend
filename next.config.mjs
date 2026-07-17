const nextConfig = {
  output: 'standalone',
  reactCompiler: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10gb',
    },
  },
};

export default nextConfig;