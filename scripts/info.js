const pkg = require('../package.json');

module.exports = function (config) {
  console.log('=========== App Information ============');

  console.log('Display Name:', config.appName);
  console.log('Bundle ID:', config.bundleId);
  console.log('Build Number:', config.build);
  console.log('Version:', config.version);
  console.log('Launch Icons:', config.launcherIcon || '<default>');
  console.log('Splash Icons:', config.splashIcon || '<default>');
  console.log('');

  console.log('========== Structure ===========');
  console.log('Workspace:', config.WORKSPACE || '<NA>');
  console.log('App Root:', config.APP_FOLDER || '<NA>')
  console.log('React Native Folder:', config.REACT_NATIVE_DIR);
  console.log('React Native Version:', config.ReactNativeVersion);
  console.log('React Version:', config.ReactVersion);
  console.log('Foundation Version:', pkg.version);
  console.log('');

  console.log('========== Release ===========');
  console.log('Android Key Store:', config.android.keyStore || '<NA>');
  console.log('iOS Team ID:', config.ios.teamId || '<NA>');
  console.log('iOS Developer ID:', config.ios.developerId || '<NA>');
  return null;
}