module.exports = {
    // reactStrictMode: false,
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://codelabspace.com/api/:path*',
        },
      ];
    },
  };
  