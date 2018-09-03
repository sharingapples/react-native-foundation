const buildIos = require('./_build-ios');

module.exports = async function(config, package) {
  await buildIos(config, package);

  return [
    '--no-packager',
  ];
};
