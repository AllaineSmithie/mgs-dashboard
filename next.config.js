const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_CONFIG_BASE_PATH,
  output: 'standalone',
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true,
  sassOptions: {
    prependData: `$BASE_PATH: '${process.env.NEXT_CONFIG_BASE_PATH}';`,
    includePaths: [path.join(__dirname, 'styles')],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Allow request to grafana. TODO: replace by SAME_ORIGIN
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM 192.168.49.2',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
