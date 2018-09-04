const path = require('path');
const fs = require('fs');
const getBuildFolder = require('./_getBuildFolder');

const dpis = [
  'mdpi',
  'hdpi',
  'xhdpi',
  'xxhdpi',
  'xxxhdpi',
];

module.exports = function buildAndroid(config) {
  const androidFolder = path.resolve(config.REACT_NATIVE_DIR, 'android');
  const buildFolder = getBuildFolder(config);
  const manifestFile = path.resolve(buildFolder, 'manifest.json');

  fs.writeFileSync(manifestFile, JSON.stringify(config, null, 2));

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
    // Replace all icons
    dpis.forEach((dpi) => {
      const file = tryCopy(dpi, config.launcherIcon, 'ic_launcher');
      // Use the rectangle file as an alternate for round
      tryCopy(dpi, config.launcherIcon, 'ic_launcher_round', file);
    });

    // Also copy the ic_launcher-web.png file required for play store
    const web = 'ic_launcher-web.png';
    const webFile = path.resolve(sourceFolder, web);
    if (fs.existsSync(webFile)) {
      fs.copyFileSync(webFile, path.resolve(androidFolder, 'app', 'src', 'main', web));
    }
  }

  if (config.splashIcon) {
    dpis.forEach((dpi) => {
      tryCopy(dpi, config.splashIcon, 'ic_splash');
    });
  }
}
