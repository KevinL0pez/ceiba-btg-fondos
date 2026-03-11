module.exports = {
  '/btg/**': {
    target: 'http://localhost:8001',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      "^/btg": ""
    }
  },
};
