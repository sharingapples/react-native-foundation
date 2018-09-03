const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const rimraf = require('rimraf');

const recursiveCopy = require('./_recursiveCopy');

module.exports = async function (config) {
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
  // Everythings ok, now make a copy through git
  const git = spawn('git', [
    'clone', '--depth',
    1,
    config.nativeRepo,
    tmpFolder,
  ], {
    stdio: ['inherit', 'inherit', 'inherit']
  });

  console.log(`Cloning remote repository ${config.nativeRepo}`);
  git.on('exit', (code) => {
    if (code === 0) {
      // Git clone is now complete, copy the ios and android folders
      // recursively
      fs.mkdirSync(iosFolder);
      recursiveCopy(path.resolve(tmpFolder, 'ios'), iosFolder, null, '');
      fs.mkdirSync(androidFolder);
      recursiveCopy(path.resolve(tmpFolder, 'android'), androidFolder, null, '');

      const gitIgnore = path.resolve(config.WORKSPACE, '.gitignore');
      if (!fs.existsSync(gitIgnore)) {
        recursiveCopy(path.resolve(tmpFolder, '.gitignore'), gitIgnore);
      } else {
        console.log('===================================');
        console.log('It looks like you already have a `.gitignore` file on your workspace. The native code produce a lot of intermediate files, which you might not want to commit to your source control. In case you are too lazy to craft your own .gitignore you can start with the one provided by foundation (react-native). Just run the command:');
        console.log('    $ foundation gitignore');
      }
    }

    // Cleanup the folder when done
    rimraf.sync(tmpFolder);

    // Also update package.json to include react and react-native
    // dependencies
    const pkgFolder = config.APP_FOLDER || config.WORKSPACE;
    const pkgFile = path.resolve(pkgFolder, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgFile));
    const old = pkg.dependencies;
    function update(name, value) {
      if (!pkg.dependencies) {
        pkg.dependencies = { [name]: v };
      } else if (!pkg.dependencies[name]) {
        pkg.dependencies[name] = value;
      } else {
        return false;
      }
      return true;
    }

    if (update('react', config.ReactVersion) ||
        update('react-native', config.ReactNativeVersion)) {
      fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2));
    }
  });

  return null;
}