import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, '..'),
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: false }
    ];
  }
};

export default nextConfig;
