const fs = require('fs');
const path = require('path');

module.exports = findNativeDependences(package, config, platform) {
  if (!config.WORKSPACE) {
    return [];
  }

  // The native package has to be available in the workspace folder
  return Object.keys(package.dependencies).filter((name) => {
    // Search for the library def within the node_modules folder
    const searchDir = config.WORKSPACE;
    const folder = path.resolve(searchDir, 'node_modules', name, platform);
    return fs.existsSync(folder) && fs.lstatSync(folder).isDirectory();
  });
}
