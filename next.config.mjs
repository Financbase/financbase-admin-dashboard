/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		// Disable Next.js ESLint during builds since we use our own ESLint config
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: false,
	},
	experimental: {
		serverActions: {
			allowedOrigins: ['localhost:3010', '127.0.0.1:3010'],
		},
		optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
	},

	// Optimize for production
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},

	// Image optimization
	images: {
		formats: ['image/webp', 'image/avif'],
		domains: ['cdn.financbase.com', 'images.unsplash.com'],
	},

	// Bundle analyzer (only in development)
	...(process.env.ANALYZE === 'true' && {
		eslint: {
			ignoreDuringBuilds: false,
		},
	}),

	// Performance optimizations
	webpack: (config, { dev, isServer }) => {
		// Optimize bundle size
		if (!dev && !isServer) {
			config.optimization.splitChunks.chunks = 'all';
			config.optimization.splitChunks.cacheGroups = {
				...config.optimization.splitChunks.cacheGroups,
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all',
				},
			};
		}

		return config;
	},

	// Output configuration for Docker
	output: 'standalone',
};

export default nextConfig;
