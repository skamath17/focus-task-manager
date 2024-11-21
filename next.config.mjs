/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // Add this line for better production build
  webpack: (config, { isServer }) => {
    // Add handling for native node modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        electron: false,
      };
    }
    return config;
  },
};

export default nextConfig;