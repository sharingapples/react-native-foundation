const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const getBuildFolder = require('./_getBuildFolder');
const Buddy = require('./_PlistBuddy');

const appIcons = [
  ['iphone', [
    '20@2x', '20@3x',
    '29@2x', '29@3x',
    '40@2x', '40@3x',
    '60@2x', '60@3x',
  ]],
  ['ipad', [
    '20@1x', '20@2x',
    '29@1x', '29@2x',
    '40@1x', '40@2x',
    '76@1x', '76@2x',
    '83.5@2x',
  ]],
  ['ios-marketing', [
    '1024@1x',
  ]]
];

module.exports = async function (config, package) {
  const manifest = {
    appName: config.appName || 'Foundaion',
    version: config.version || '1.0',
    bundleId: config.bundleId || 'com.reactjs.foundation',
    build: config.build || 1,
  };

  const iosFolder = path.resolve(config.REACT_NATIVE_DIR, 'ios');
  const buildFolder = getBuildFolder(config);

  const infoPlist = path.resolve(iosFolder, 'Foundation', 'Info.plist');

  try {
    // use PlistBuddy to make changes to Info.plist
    await Buddy(infoPlist, `SET :CFBundleDisplayName ${manifest.appName}`);
    await Buddy(infoPlist, `SET :CFBundleIdentifier ${manifest.bundleId}`);
    await Buddy(infoPlist, `SET :CFBundleShortVersionString ${manifest.version}`);
    await Buddy(infoPlist, `SET :CFBundleVersion ${manifest.build}`);
  } catch (err) {
    console.error(err);
  }

  // Copy the launcher icons
  if (config.launcherIcon) {
    const ContentsJson = {
      images: [],
      info: { version: 1, author: 'foundation' },
    };

    const assetsFolder = path.resolve(iosFolder, 'Foundation', 'Images.xcassets', 'AppIcon.appiconset');
    appIcons.forEach(([type, sizes]) => {
      sizes.forEach((size) => {
        const [sz, scale] = size.split('@');
        const info = {
          idiom: type,
          size: `${sz}x${sz}`,
          scale: scale,
        };
        ContentsJson.images.push(info);

        const name = `ios-${sz}@${scale}.png`;
        const src = path.resolve(config.launcherIcon, name);
        if (!fs.existsSync(src)) {
          console.warn(`WARN::Launcher icon not found for ios ${type}-${size}x${size}@${scale} [${src}]`);
          return;
        }

        const target = `${type}-${sz}@${scale}.png`;
        const targetFile = path.resolve(assetsFolder, target);
        if (fs.existsSync(targetFile)) {
          fs.unlinkSync(targetFile);
        }

        fs.copyFileSync(src, targetFile);
        info.filename = target;
      });
    });

    const contentFile = path.resolve(assetsFolder, 'Contents.json');
    fs.writeFileSync(contentFile, JSON.stringify(ContentsJson, null, 2));
  }

  if (config.splashIcon) {
    const assetsFolder = path.resolve(iosFolder, 'Foundation', 'Images.xcassets', 'Splash.imageset');

    const ContentsJson = {
      images: [],
      info: { version: 1, author: 'foundation' },
    };

    ['1x', '2x', '3x'].forEach((scale) => {
      const info = {
        "idiom": "universal",
        "scale": scale,
      };
      ContentsJson.images.push(info);

      const name = `ios-splash@${scale}.png`;
      const src = path.resolve(config.splashIcon, name);
      if (!fs.existsSync(src)) {
        console.warn(`WARN::Splash icon not found for ios ios-splash@${scale}.png`);
        return;
      }

      const targetFile = path.resolve(assetsFolder, name);
      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile);
      }

      fs.copyFileSync(src, targetFile);
      info.filename = name;
    });

    const contentFile = path.resolve(assetsFolder, 'Contents.json');
    fs.writeFileSync(contentFile, JSON.stringify(ContentsJson, null, 2));
  }

  return new Promise((resolve, reject) => {
    // Perform a pod install
    console.log('POD::INSTALL');
    const podInstall = spawn('pod', ['install'], {
      cwd: path.resolve(iosFolder),
      stdio: ['inherit', 'inherit', 'inherit']
    });

    podInstall.on('exit', (code) => {
      if (code !== 0) {
        return reject(new Error(`Error while installing pods. Code: ${code}`));
      }

      resolve([
        '--no-packager',
      ]);
    });
  });
};
