
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const origin = process.env.ORIGIN_URL;
    if (!origin) {
      throw new Error('ORIGIN_URL no definida');
    }

    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin',      value: origin },
          { key: 'Access-Control-Allow-Methods',     value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers',     value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },
};

export default nextConfig;
