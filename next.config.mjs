/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
	reactStrictMode: true,
	typescript: {
		ignoreBuildErrors: false,
	},
	// Disable OpenTelemetry to prevent API compatibility issues
	env: {
		OTEL_SDK_DISABLED: 'true',
		NEXT_OTEL_VERBOSE: '0',
		NEXT_TELEMETRY_DISABLED: '1',
		OTEL_TRACES_EXPORTER: 'none',
		OTEL_METRICS_EXPORTER: 'none',
		OTEL_LOGS_EXPORTER: 'none',
	},
	experimental: {
		// Server actions are enabled by default in Next.js 16
		optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
		// Disable experimental features that might cause module resolution issues
		optimizeCss: false,
	},

	// Image optimization
	images: {
		formats: ['image/webp', 'image/avif'],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cdn.financbase.com',
			},
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: 'fonts.googleapis.com',
			},
			{
				protocol: 'https',
				hostname: 'fonts.gstatic.com',
			},
			{
				protocol: 'https',
				hostname: 'opencv.org',
			},
		],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		loader: 'default',
		minimumCacheTTL: 60,
	},

	// Redirects for backward compatibility
	redirects: async () => {
		return [
			{
				source: '/auth/signin',
				destination: '/auth/sign-in',
				permanent: true,
			},
			{
				source: '/auth/signup',
				destination: '/auth/sign-up',
				permanent: true,
			},
		];
	},

	// Webpack configuration for module resolution
	webpack: (config, { dev, isServer }) => {
		// Handle Node.js modules in browser environment
		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			path: false,
			stream: false,
			crypto: false,
			os: false,
			util: false,
			buffer: false,
			events: false,
			querystring: false,
			url: false,
			net: false,
			tls: false,
			child_process: false,
			dns: false,
			http: false,
			https: false,
			zlib: false,
			readline: false,
			cluster: false,
			worker_threads: false,
		};

		// Handle server-side modules
		if (isServer) {
			config.externals = [...(config.externals || []), 'pg-native'];
		}

		// Exclude database modules from client bundle
		if (!isServer) {
			config.resolve.alias = {
				...config.resolve.alias,
				'@/lib/neon': false,
				'@/lib/services/content/search-service': false,
				'@/lib/db': false,
			};
		}

		// Let Next.js handle chunk optimization - don't override
		return config;
	},
	headers: async () => {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
					{
						key: 'Permissions-Policy',
						value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
					},
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=31536000; includeSubDomains',
					},
					{
						key: 'Content-Security-Policy',
						value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.financbase.com https://js.clerk.com https://clerk.com https://content-alien-33.clerk.accounts.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.financbase.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.financbase.com wss://ws.financbase.com https://clerk.com https://content-alien-33.clerk.accounts.dev https://clerk-telemetry.com; frame-src https://clerk.com https://js.clerk.com https://content-alien-33.clerk.accounts.dev; worker-src 'self' blob:;",
					},
				],
			},
		];
	},

	// Development mode configuration
	output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

	eslint: {
		// Disable Next.js ESLint to avoid conflicts with flat config
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
