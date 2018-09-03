const buildAndroid = require('./_buildAndroid');

module.exports = function (config, package) {
  buildAndroid(config, package);

  return [
    // Do not start the default packager
    '--no-packager',

    // appId is now customizable via config
    '--appId',
    config.bundleId,

    // Foundation starts with SplashActivity and not MainActivity
    '--main-activity',
    'SplashActivity',
  ];
};
