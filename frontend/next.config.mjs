/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
    },
    async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: 'https://avea-backend-4ykll4ioma-uc.a.run.app/:path*',
          },
        ]
      },
};

export default nextConfig;
