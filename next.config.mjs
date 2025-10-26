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

	// Turbopack configuration (Next.js 16 default)
	turbopack: {
		// Enable experimental features for better development experience
	},

	// Development mode configuration
	output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

	// Enable static asset optimization
	assetPrefix: undefined,
};

export default nextConfig;
