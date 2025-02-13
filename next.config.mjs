/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      esmExternals: true, // Ensures ESM support for JSON imports
    },
  };
  
  export default nextConfig;
