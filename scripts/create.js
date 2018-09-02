const fs = require('fs');
const path = require('path');

const textFiles = [
  '.ts', '.js', '.json', '.txt', '.html', '.css', '.less',
  '.java', '.m', '.h', '.plist', '.ini',
];

function copyFiles(sourceFolder, targetFolder, variables) {
  const files = fs.readdirSync(sourceFolder);
  console.log(files);
  files.forEach((file) => {
    // Template files begin with '__'
    if (!file.startsWith('__')) {
      return;
    }

    const sourceFile = path.resolve(sourceFolder, file);
    const targetFile = path.resolve(targetFolder, file.substr(2));
    if (fs.lstatSync(sourceFile).isDirectory()) {
      fs.mkdirSync(targetFile);
      copyFiles(sourceFile, targetFile, variables);
      return;
    }

    // Just create a copy if its not a test file
    if (!textFiles.some(t => sourceFile.endsWith(t))) {
      fs.copyFileSync(sourceFile, targetFile);
    } else {
      const data = fs.readFileSync(sourceFile, 'utf-8');
      // perform a regular expression replace from variables
      const content = data.replace(/\{\{([^{]*)\}\}/mg, (match, key) => variables[key]);
      fs.writeFileSync(targetFile, content, "utf-8");
    }
  });
}

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
