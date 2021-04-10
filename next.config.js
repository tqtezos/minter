const withPWA = require('next-pwa');
const path = require('path');
module.exports = withPWA({
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  images: {
    domains: ['gateway.pinata.cloud']
  },
  future: {
    webpack5: true,
  },
  optimization: {
    mangleWasmImports: true,
    removeAvailableModules: true
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
    });
    return config;
  },
});