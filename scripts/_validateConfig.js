const fs = require('fs');
const path = require('path');

module.exports = (pkg) => {
  const config = require(path.resolve('foundation.config.js'));

  const res = {};

  res.appName = config.appName || 'Foundation Demo';
  res.bundleId = config.bundleId || 'com.reactjs.foundation.demo';

  if (config.build) {
    if (typeof config.build !== 'number') {
      throw new Error('Error in configuration, build should be a number');
    } else if (config.build <= 0 || `${config.build}`.indexOf('.') >= 0) {
      throw new Error(`Error in configuration, build should a positive integer`);
    }
  }
  res.build = config.build || 1;

  if (config.version) {
    // see if the version should be read from the package.json file
    if (config.version === '*') {
      res.version = pkg.version;
    } else {
      res.version = config.version;
    }
  }
  res.version = res.version || '1.0';

  if (config.launcher) {
    // the launcher icon is supposed to be a folder
    const folder = path.resolve(config.launcher);
    if (!fs.existsSync(folder) || !fs.lstatSync(folder).isDirectory()) {
      throw new Error('Launcher icon is supposed to be a folder consisting of launch icons of various sizes');
    }

    res.launcherIcon = folder;
  }

  if (config.splash) {
    const folder = path.resolve(config.splash);
    if (!fs.existsSync(folder) || !fs.lstatSync(folder).isDirectory()) {
      throw new Error('Splash icon is supposed to be a folder consisting of splash icons of various sizes');
    }

    res.splashIcon = folder;
  }

  // Native Repo source to extract android and ios folders
  res.nativeRepo = config.nativeRepo || 'git@github.com:sharingapples/react-native-foundation.git';

  // Release keys
  res.androidKeyStore = config.androidKeyStore;
  return res;
}


