/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: false,       
    experimental: {
      serverSourceMaps: false,                
    },
    webpack(config, { dev, isServer }) {
      if (dev && !isServer) {
        config.devtool = false;
      }
      return config;
    }
  };
  
  export default nextConfig;
  