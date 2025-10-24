/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	typescript: {
		ignoreBuildErrors: true,
	},
	experimental: {
		serverActions: {
			allowedOrigins: ['localhost:3010', '127.0.0.1:3010'],
		},
		optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
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
		],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		loader: 'default',
		minimumCacheTTL: 60,
	},

	// Redirects for backward compatibility
	async redirects() {
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

	// Disable Jest during build to prevent worker issues
	webpack: (config, { dev, isServer }) => {
		if (!dev) {
			// Disable Jest integration during production build
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
			};
		}
		return config;
	},

	// Output configuration for Docker
	output: 'standalone',
};

export default nextConfig;
