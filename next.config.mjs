/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 70, 75],
  },
  // Media and mascot layers rarely change; let browsers reuse them for a week between visits.
  async headers() {
    const week = { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' };
    return [
      { source: '/video/:path*', headers: [week] },
      { source: '/xo/:path*', headers: [week] },
    ];
  },
};

export default nextConfig;
