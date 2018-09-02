const fs = require('fs');
const path = require('path');
const config = require(path.resolve('foundation.config.js'));

module.exports = (pkg) => {
  const res = {};

  if (config.appName) {
    // Make sure the appname is a valid string
    res.appName = config.appName;
  }

  if (config.bundleId) {
    // Make sure the bundleId is a valid string
    res.bundleId = config.bundleId;
  }

  if (config.build) {
    if (typeof config.build !== 'number') {
      throw new Error('Error in configuration, build should be a number');
    } else if (config.build <= 0 || `${config.build}`.indexOf('.') >= 0) {
      throw new Error(`Error in configuration, build should a positive integer`);
    }
  }

  if (config.version) {
    // see if the version should be read from the package.json file
    if (config.version === '*') {
      res.version = pkg.version;
    } else {
      res.version = config.version;
    }
  }

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

  return res;
}


