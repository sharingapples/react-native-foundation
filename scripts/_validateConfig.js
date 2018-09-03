const fs = require('fs');
const path = require('path');

function coalesce(...args) {
  return args.find(arg => arg !== null && arg !== undefined);
}

module.exports = (pkg, platform) => {
  const config = require(path.resolve('foundation.config.js'));

  const res = {};
  const platformConfig = coalesce(config[platform], {});

  res.appName = coalesce(platformConfig.appName, config.appName, 'Foundation Demo');
  res.bundleId = coalesce(platformConfig.bundleId, config.bundleId, 'com.reactjs.foundation.demo');

  res.build = coalesce(platformConfig.build, config.build, 1);
  if (typeof res.build !== 'number') {
    throw new Error('Error in configuration, build should be a number');
  } else if (res.build <= 0 || `${res.build}`.indexOf('.') >= 0) {
    throw new Error(`Error in configuration, build should a positive integer`);
  }

  res.version = coalesce(platformConfig.version, config.version, '1.0');
  if (res.version === '*') {
    res.version = pkg.version;
  }

  res.launcherIcon = coalesce(platformConfig.launcher, config.launcher);
  if (res.launcherIcon) {
    res.launcherIcon = path.resolve(res.launcherIcon);
    if (!fs.existsSync(res.launcherIcon) || !fs.lstatSync(res.launcherIcon).isDirectory()) {
      throw new Error('Launcher icon is supposed to be a folder consisting of launch icons of various sizes');
    }
  }

  res.splashIcon = coalesce(platformConfig.splash, config.splash);
  if (res.splashIcon) {
    res.splashIcon = path.resolve(res.splashIcon);
    if (!fs.existsSync(res.splashIcon) || !fs.lstatSync(res.splashIcon).isDirectory()) {
      throw new Error('Splash icon is supposed to be a folder consisting of splash icons of various sizes');
    }
  }

  // Native Repo source to extract android and ios folders
  res.nativeRepo = coalesce(config.nativeRepo, 'git@github.com:sharingapples/react-native-foundation.git');

  // Android keys
  res.android = config.android || {};

  // ios keys
  res.ios = config.ios || {};

  return res;
}


