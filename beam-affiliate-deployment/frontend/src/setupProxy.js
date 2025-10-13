const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // API proxy - must come before React Router
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying:', req.method, req.url, '->', proxyReq.path);
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({ error: 'Proxy error', details: err.message });
      },
    })
  );
}; 