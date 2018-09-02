const fs = require('fs');
const path = require('path');

const textFiles = [
  '.ts', '.js', '.json', '.txt', '.html', '.css', '.less',
  '.java', '.m', '.h', '.plist', '.ini',
];

function isTextFile(file) {
  return textFiles.some(file.endsWith);
}

module.exports = function copyFiles(sourceFolder, targetFolder, variables = null, prefix = '__') {
  const files = fs.readdirSync(sourceFolder);
  files.forEach((file) => {
    // Template files begin with '__'
    if (prefix && !file.startsWith('__')) {
      return;
    }

    const prefixLength = prefix ? prefix.length : 0;

    const sourceFile = path.resolve(sourceFolder, file);
    const targetFile = path.resolve(targetFolder, file.substr(prefixLength));
    if (fs.lstatSync(sourceFile).isDirectory()) {
      fs.mkdirSync(targetFile);
      copyFiles(sourceFile, targetFile, variables, prefix);
      return;
    }

    // Just create a copy if its not a text file, or there is
    // no variables list to replace
    if (!variables || !textFiles.some(t => sourceFile.endsWith(t))) {
      fs.copyFileSync(sourceFile, targetFile);
    } else {
      const data = fs.readFileSync(sourceFile, 'utf-8');
      // perform a regular expression replace from variables
      const content = data.replace(/\{\{([^{]*)\}\}/mg, (match, key) => variables[key]);
      fs.writeFileSync(targetFile, content, "utf-8");
    }
  });
}
