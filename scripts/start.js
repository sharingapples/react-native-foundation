const fs = require('fs');
const path = require('path');

module.exports = function (config) {
  console.log('config', config);
  const projectRoots = [process.cwd()];
  const extraConfig = [];

  // Check if we have a workspace, in which case include work space
  // in the project root
  if (config.WORKSPACE && process.cwd() !== config.WORKSPACE) {
    projectRoots.push(config.WORKSPACE);
  }

  // If the workspace has react-native, then no need to use
  // react-native provided by foundation
  if (config.WORKSPACE !== config.REACT_NATIVE_DIR) {
    projectRoots.push(config.REACT_NATIVE_DIR);

    // Include the extra node_modules definition, otherwise react won't be resolved
    extraConfig.push('--config');
    extraConfig.push(path.resolve(__dirname, '..', 'extra.config.js'));
  }

  return [
    '--projectRoots',
    projectRoots.join(','),
  ].concat(extraConfig);
};
