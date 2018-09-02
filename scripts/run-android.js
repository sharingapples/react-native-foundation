const fs = require('fs');
const getBuildFolder = require('./_getBuildFolder');
const path = require('path');

const dpis = [
  'mdpi',
  'hdpi',
  'xhdpi',
  'xxhdpi',
  'xxxhdpi',
];

module.exports = function (config, package) {
  // Update the app name, bundleId, build, version into the manifest
  const manifest = {
    appName: config.appName || 'Foundation',
    version: config.version || '1.0',
    bundleId: config.bundleId || 'com.reactjs.foundation',
    build: config.build || 1,
  };

  const androidFolder = path.resolve(config.REACT_NATIVE_DIR, 'android');
  const buildFolder = getBuildFolder(config);
  const manifestFile = path.resolve(buildFolder, 'manifest.json');

  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));


  function tryCopy(dpi, sourceFolder, name, alternate) {
    const targetFolder = path.resolve(androidFolder, 'app', 'src', 'main', 'res', `mipmap-${dpi}`);
    const targetFile = path.resolve(targetFolder, `${name}.png`);
    // Remove the target if it exists
    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
    }

    const source = path.resolve(sourceFolder, `${name}-${dpi}.png`);
    if (!fs.existsSync(source)) {
      console.warn(`WARN::Android source file not found for ${dpi}/${name} [${source}]`);
      if (alternate) {
        fs.copyFileSync(alternate, targetFile);
      }
      return alternate;
    }

    // Copy the file
    fs.copyFileSync(source, targetFile);
    return source;
  }

  // Update the launcher icons and splash icons
  if (config.launcherIcon) {
    console.log('Launcher icons at', config.launcherIcon);
    // Replace all icons
    dpis.forEach((dpi) => {
      const file = tryCopy(dpi, config.launcherIcon, 'ic_launcher');
      // Use the rectangle file as an alternate for round
      tryCopy(dpi, config.launcherIcon, 'ic_launcher_round', file);
    });
  }

  if (config.splashIcon) {
    dpis.forEach((dpi) => {
      tryCopy(dpi, config.splashIcon, 'ic_splash');
    });
  }

  return [
    // Do not start the default packager
    '--no-packager',

    // appId is now customizable via config
    '--appId',
    manifest.bundleId,

    // Foundation starts with SplashActivity and not MainActivity
    '--main-activity',
    'SplashActivity',
  ];
};
