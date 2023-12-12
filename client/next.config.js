/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    webpack: config => {
        config.externals = [...config.externals, { canvas: 'canvas' }]; // required to make Konva & react-konva work
        return config;
    },
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    },
    reactStrictMode: true,
    env: {
        GENERATOR_URL: process.env.GENERATOR_URL,
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;
