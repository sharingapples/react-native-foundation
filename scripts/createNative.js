const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const rimraf = require('rimraf');

const recursiveCopy = require('./_recursiveCopy');

module.exports = function (config) {
  if (!config.WORKSPACE) {
    throw new Error('Make sure you have a valid workspace for including native-modules');
  }

  console.log('workspace', config.WORKSPACE);

  // The native code includes an android folder and ios folder
  const iosFolder = path.resolve(config.WORKSPACE, 'ios');
  const androidFolder = path.resolve(config.WORKSPACE, 'android');

  if (fs.existsSync(iosFolder)) {
    throw new Error('An ios folder already exists on your workspace. The folder cannot be replaced.');
  }

  if (fs.existsSync(androidFolder)) {
    throw new Error('An android folder already exists on your workspace. The folder cannot be replaced.');
  }

  const tmpFolder = fs.mkdtempSync(os.tmpdir());
  console.log('Temp folder', tmpFolder);
  // Everythings ok, now make a copy through git
  const git = exec('git clone --depth 1 git@github.com:sharingapples/react-native-foundation.git .', {
    cwd: tmpFolder
  });

  console.log('Cloning remote repository github:sharingapples/react-native-foundation.git');
  git.on('exit', (code) => {
    if (code === 0) {
      // Git clone is now complete, copy the ios and android folders
      // recursively
      fs.mkdirSync(iosFolder);
      recursiveCopy(path.resolve(tmpFolder, 'ios'), iosFolder, null, '');
      fs.mkdirSync(androidFolder);
      recursiveCopy(path.resolve(tmpFolder, 'android'), androidFolder, null, '');
    }

    // Cleanup the folder when done
    rimraf.sync(tmpFolder);
  });

  return null;
}