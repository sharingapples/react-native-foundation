const fs = require('fs');
const path = require('path');
const copyFiles = require('./_recursiveCopy');

const textFiles = [
  '.ts', '.js', '.json', '.txt', '.html', '.css', '.less',
  '.java', '.m', '.h', '.plist', '.ini',
];

module.exports = function (config, package, args) {
  // Init will create an index.js and a package.json file.
  // the only files required for creating a foundation app

  if (args.length === 0) {
    console.log('Usage: foundation init <ProjectName>');
  }

  const projectFolder = path.resolve(args[1]);
  if (fs.existsSync(projectFolder)) {
    console.log('Looks like React Native project already exists in the in the current folder. Run this command from a different folder');
    return null;
  }

  // Create the folder
  fs.mkdirSync(projectFolder);
  const templateVar = {
    ProjectName: args[1],
    ReactVersion: config.ReactVersion,
    ReactNativeVersion: config.ReactNativeVersion,
  };

  copyFiles(path.resolve(__dirname, '_templates'), projectFolder, templateVar);
  return null;
}
