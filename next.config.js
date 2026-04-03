/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    'react-markdown',
    'remark-math',
    'rehype-katex',
    'remark-gfm',
  ],
  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

module.exports = nextConfig;
