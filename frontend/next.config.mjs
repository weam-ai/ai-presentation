import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The repo has lockfiles in root and frontend; pin the tracing root.
  outputFileTracingRoot: path.join(__dirname, '..'),
  images: {
    // Stock images come from arbitrary remote hosts (Pexels/Pixabay).
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
