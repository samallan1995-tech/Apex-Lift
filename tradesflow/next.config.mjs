/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA headers for service worker scope
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
  // Allow Stripe domains for images
  images: {
    domains: ['stripe.com'],
  },
}

export default nextConfig
