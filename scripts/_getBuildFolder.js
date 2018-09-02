const path = require('path');
const fs = require('fs');

module.exports = function getBuildFolder(config) {
  const buildFolder = path.resolve(config.REACT_NATIVE_DIR, 'build');
  if (!fs.existsSync(buildFolder)) {
    fs.mkdirSync(buildFolder);
  }

  return buildFolder;
}
