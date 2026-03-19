/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },
    swcMinify: false,
};

module.exports = nextConfig;
