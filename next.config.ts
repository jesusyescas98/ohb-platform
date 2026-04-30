import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove X-Powered-By header to avoid exposing server info
  poweredByHeader: false,

  // Enable React strict mode for better performance and error detection
  reactStrictMode: true,

  // Image optimization settings
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'hcdjwrgisurjskzmypkh.supabase.co',
        pathname: '/**',
      },
    ],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 1 year
    minimumCacheTTL: 31536000,
  },

  // Redirect trailing slashes for SEO consistency
  trailingSlash: false,

  // Compress responses
  compress: true,

  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // XSS Protection (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer Policy - balanced for SEO (sends referrer to same-origin, origin only cross-origin)
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy - restrict browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=(self), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
          // HSTS - Force HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Content Security Policy - Updated for Google Ads & Analytics compatibility
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://www.google.com https://tpc.googlesyndication.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https: https://www.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://hcdjwrgisurjskzmypkh.supabase.co",
              "connect-src 'self' https: https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://hcdjwrgisurjskzmypkh.supabase.co",
              "frame-src https://www.google.com https://www.google.com/maps https://tpc.googlesyndication.com https://googleads.g.doubleclick.net",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // Prevent cross-origin information leakage
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
          // Allow DNS prefetch for performance (important for SEO/Core Web Vitals)
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // Cache static assets for performance (Core Web Vitals)
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|otf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // SEO-relevant redirects
  async redirects() {
    return [
      // Redirect common misspellings or old URLs
      {
        source: '/nosotros',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/portafolio',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/academia',
        destination: '/academy',
        permanent: true,
      },
      {
        source: '/servicios',
        destination: '/services/real-estate',
        permanent: true,
      },
      {
        source: '/inversiones',
        destination: '/services/investments',
        permanent: true,
      },
      {
        source: '/privacidad',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/terminos',
        destination: '/terms',
        permanent: true,
      },
    ];
  },

  // API rewrites (if needed in future)
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },

  // Environment variable validation at build time
  env: {
    // Ensure critical env vars are present at build time
    BUILD_ENV: process.env.NODE_ENV || 'development',
  },

  // TypeScript configuration
  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Experimental features
  experimental: {
    // Enable new App Router features
    esmExternals: true,
  },
};

export default nextConfig;
