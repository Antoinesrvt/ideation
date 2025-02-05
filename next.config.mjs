/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to load these Node.js only modules on the client
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        stream: false,
        string_decoder: false,
        dns: false,
        dgram: false,
        child_process: false,
        cluster: false,
        module: false,
        os: false,
        readline: false,
        repl: false,
        tty: false,
        worker_threads: false,
        http: false,
        https: false,
        zlib: false,
      };
    }
    return config;
  },
  // Update to latest stable version
  experimental: {
    optimizePackageImports: ['@tootallnate/quickjs-emscripten']
  }
};

export default nextConfig;
