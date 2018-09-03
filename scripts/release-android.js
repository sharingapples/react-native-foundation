const os = require('os');
const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');

const buildAndroid = require('./_buildAndroid');

module.exports = async function(config) {
  // KeyStore file is required for releasing an android app
  if (!config.androidKeyStore) {
    throw new Error('Android key store file needs to be provided for releasing. `androidKeyStore` in foundation.config.js');
  }

  const keyStoreFile = config.androidKeyStore.startsWith('~/') ?
    path.resolve(os.homedir(), config.androidKeyStore.substr(2)) :
    path.resolve(config.androidKeyStore);

  if (!fs.existsSync(keyStoreFile)) {
    throw new Error(`Key Store file ${config.androidKeyStore} doesn't exist`);
  }

  const androidFolder = path.resolve(config.REACT_NATIVE_DIR, 'android');

  if (!process.env.ANDROID_HOME) {
    throw new Error('Android SDK could not be detected. Please make sure you have set the ANDROID_HOME with proper path on your environment');
  }

  // Let's make sure we have access to build tools
  console.log('Android SDK:', process.env.ANDROID_HOME);

  // Get build tool version provided in the build.gradle
  const prjGradle = path.resolve(androidFolder, 'build.gradle');
  const gradleFile = fs.readFileSync(prjGradle, 'utf-8');
  const m = gradleFile.match(/buildToolsVersion\s*=\s*"([0-9.]*)"/);
  if (!m) {
    throw new Error('Couldn\'t detect build tool version in the android gradle file. Make sure you are using the react-native 0.55 or higher');
  }

  const buildToolVersion = m[1];
  const buildTools = path.resolve(process.env.ANDROID_HOME, 'build-tools', buildToolVersion);
  if (!fs.existsSync(buildTools)) {
    throw new Error(`Couldn't find android build tools for version ${buildToolVersion}`);
  }
  console.log('Using Build Tools Version:', buildToolVersion);

  const zipalign = path.resolve(buildTools, 'zipalign');
  const apksigner = path.resolve(buildTools, 'apksigner');

  const apkFolder = path.resolve(androidFolder, 'app', 'build', 'outputs', 'apk');
  const unsignedApk = path.resolve(apkFolder, 'app-release-unsigned.apk');
  const zipApk = path.resolve(apkFolder, 'app-release-aligned.apk');
  const releaseApk = path.resolve(apkFolder, 'app-release.apk');

  // Delete the unsigned apk
  if (fs.existsSync(unsignedApk)) fs.unlinkSync(unsignedApk);
  if (fs.existsSync(zipApk)) fs.unlinkSync(zipApk);

  // Generate all files required for building
  buildAndroid(config);

  // Perform gradle task to create unsigned, unaligned apk
  const build = spawn('./gradlew', ['assembleRelease'], {
    cwd: androidFolder,
    stdio: ['inherit', 'inherit', 'inherit'],
  });

  return new Promise((resolve, reject) => {
    build.on('exit', (code) => {
      if (code !== 0) {
        return reject(`Android build failed with error code: ${code}`);
      }

      console.log('Zip Align the APK');
      // First zip align the apk
      let res = spawnSync(zipalign, ['-v', '-p', 4, unsignedApk, zipApk], {
        cwd: apkFolder,
        stdio: ['inherit', 'inherit', 'inherit']
      });
      if (res.status !== 0) {
        return reject(new Error(`Zip align failed with error code ${res.status}`));
      }

      console.log('Sign the APK');

      let tries = 0;
      const MAX_TRIES = 3;
      do {
        // Sign the zipped apk
        res = spawnSync(apksigner, [
          'sign',
          '-ks', keyStoreFile,
          '--out', releaseApk,
          zipApk
        ], {
          cwd: apkFolder,
          stdio: ['inherit', 'inherit', 'inherit']
        });

        if (res.status === 2 && tries < MAX_TRIES) {
          // Looks like the user got the password wrong,
          console.log('Password didn\'t match. Please try again');
        } else if (res.status !== 0) {
          return reject(new Error(`App signing failed with error code: ${res.status}`));
        }
      } while (res.status !== 0 && tries < MAX_TRIES);

      console.log('========================================');
      console.log(`  ${releaseApk}`);
      console.log('----------------------------------------');
      console.log(`Run adb install -r ${releaseApk}`);
      console.log('----------------------------------------');
      console.log('Your app is now ready for google play store');

      resolve(null);
    });
  });
}