const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/v1/ws', {
      target: 'http://localhost:5000',
      changeOrigin: true,
      logLevel: 'debug',
      ws: true,
    })
  );
};
