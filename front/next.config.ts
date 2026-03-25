import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	output: 'standalone',
	async rewrites() {
		return [
			{
				source: '/backend/:path*',
				destination: `${process.env.BACKEND_URL ?? 'http://localhost:3000'}/api/:path*`,
			},
		];
	},
};

export default nextConfig;
