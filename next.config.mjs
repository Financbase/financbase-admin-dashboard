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
	
	// Disable Turbopack to use webpack (we have custom webpack config)
	// Note: Next.js 16 uses Turbopack by default, but we need webpack for IRS Direct File integration
	webpack: (config, { dev, isServer, webpack }) => {
		// This is defined below, but we need to ensure webpack is used
		return config;
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
				hostname: 'source.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: 'picsum.photos',
			},
			{
				protocol: 'https',
				hostname: 'images.pexels.com',
			},
			{
				protocol: 'https',
				hostname: 'www.pexels.com',
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
			{
				protocol: 'https',
				hostname: 'cdn.jsdelivr.net',
			},
			{
				protocol: 'https',
				hostname: 'logo.clearbit.com',
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
	// This replaces the default webpack function above
	webpack: (config, { dev, isServer, webpack }) => {
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

		// Enhanced module resolution to prevent undefined module errors
		// Configure module resolution for IRS Direct File integration
		// Allow .js imports to resolve to .tsx/.ts files (TypeScript feature)
		config.resolve = {
			...config.resolve,
			// Ensure proper module resolution
			fullySpecified: false,
			// Add extensions for better module resolution
			// This allows .js imports to resolve to .ts/.tsx files (used by IRS Direct File)
			extensionAlias: {
				'.js': ['.ts', '.tsx', '.js', '.jsx'],
				'.jsx': ['.tsx', '.jsx'],
			},
			// Ensure modules are properly resolved
			modules: [
				...(config.resolve?.modules || []),
				'node_modules',
			],
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

		// Enhanced chunk loading configuration for better error handling
		if (!isServer) {
			// Configure chunk loading with better error handling
			config.optimization = {
				...config.optimization,
				// Ensure consistent chunk IDs for better loading and cache busting
				// 'named' in dev provides better debugging, 'deterministic' in prod for stable hashes
				moduleIds: dev ? 'named' : 'deterministic',
				chunkIds: dev ? 'named' : 'deterministic',
				// In development, use simpler chunk splitting to avoid chunk loading issues
				// In production, split chunks more aggressively
				splitChunks: dev ? {
					// Development: simpler chunking to reduce chunk loading errors
					chunks: 'all',
					cacheGroups: {
						...config.optimization?.splitChunks?.cacheGroups,
						default: {
							minChunks: 2,
							priority: -20,
							reuseExistingChunk: true,
						},
						vendor: {
							test: /[\\/]node_modules[\\/]/,
							name: 'vendors',
							priority: -10,
							reuseExistingChunk: true,
						},
					},
				} : {
					// Production: more aggressive splitting
					chunks: 'all',
					cacheGroups: {
						...config.optimization?.splitChunks?.cacheGroups,
						default: {
							minChunks: 2,
							priority: -20,
							reuseExistingChunk: true,
						},
						vendor: {
							test: /[\\/]node_modules[\\/]/,
							name: 'vendors',
							priority: -10,
							reuseExistingChunk: true,
						},
					},
				},
			};

			// Ensure output configuration exists for chunk loading
			if (!config.output) {
				config.output = {};
			}
			
			// Set chunk loading global variable name for better error tracking
			// This helps identify chunk loading errors in the console
			config.output.chunkLoadingGlobal = 'webpackChunkLoad';
			
			// Add error handling for chunk loading
			// Use shorter timeout in dev to catch issues faster, longer in prod for reliability
			config.output.chunkLoadTimeout = dev ? 30000 : 120000;
			
			// Improve chunk filename generation for better cache busting
			// In development, use simpler naming to avoid stale chunk references
			// In production, use content hash for stable caching and cache busting
			if (dev) {
				// Development: simpler naming without contenthash to avoid stale references
				// Next.js will handle cache busting via query params in dev mode
				config.output.chunkFilename = '[name].chunk.js';
			} else {
				// Production: use content hash for stable caching
				config.output.chunkFilename = '[name].[contenthash:8].chunk.js';
			}
			
			// Add DefinePlugin to expose chunk error handler globally
			config.plugins = [
				...(config.plugins || []),
				new webpack.DefinePlugin({
					'__WEBPACK_CHUNK_ERROR_HANDLER__': JSON.stringify(true),
				}),
			];
		}

		// Add better error handling for module resolution
		config.ignoreWarnings = [
			...((config.ignoreWarnings && Array.isArray(config.ignoreWarnings)) ? config.ignoreWarnings : []),
			// Ignore warnings about missing exports (common in some packages)
			/export .* was not found in/,
			// Ignore warnings about module resolution
			/Module not found: Error: Can't resolve/,
		];

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
};

export default nextConfig;
