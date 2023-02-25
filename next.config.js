module.exports = {
  nextConfig: {
    reactStrictMode: true,
    swcMinify: true,
  },
  async redirects() {
    return [
      {
        source: '/user',
        destination: '/',
        permanent: true,
      }, {
        source: '/glossary',
        destination: '/',
        permanent: true,
      }
    ]
  },
}
