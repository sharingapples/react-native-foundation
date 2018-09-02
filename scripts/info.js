const pkg = require('../package.json');

module.exports = function (config) {
  console.log('Project information');
  console.log('====================');

  console.log('App Display Name:', config.appName);
  console.log('App Bundle ID:', config.bundleId);
  console.log('App Build Number:', config.build);
  console.log('App Version:', config.version);
  console.log('Launch Icons:', config.launcherIcon || 'default');
  console.log('Splash Icons:', config.splashIcon || 'default');

  console.log('====================')
  console.log('Workspace:', config.WORKSPACE || '<NA>');
  console.log('App Root:', config.APP_FOLDER || '<NA>')
  console.log('React Native Folder:', config.REACT_NATIVE_DIR);
  console.log('React Native Version:', config.ReactNativeVersion);
  console.log('React Version:', config.ReactVersion);
  console.log('Foundation Version:', pkg.version);

  return null;
}