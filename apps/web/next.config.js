import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Helps Next.js find the correct workspace root for tracing during build
	outputFileTracingRoot: path.join(__dirname, '../../'),
	// Silence Turbopack root inference warning in dev
	turbopack: {
		root: path.join(__dirname, '../../'),
	},
};

export default nextConfig;
