#!/usr/bin/env node
// Gather information about the context
// based on from where the app is being run
const fs = require('fs');
const path = require('path');

const execRN = require('./_execRN');

const start = require('./start');
const runIos = require('./run-ios');
const runAndroid = require('./run-android');

const commands = {
  start,
  'run-ios': runIos,
  'run-android': runAndroid,
};

const config = {
  // Use the react-native folder from the foundation library by default
  REACT_NATIVE_DIR: path.resolve(__dirname, '..'),
  WORKSPACE: null,
};

// The react-native command is available as 3rd argument
const cmd = process.argv[2];
const remaining = process.argv.slice(2);
if (!commands[cmd]) {
  console.warn(`Command '${cmd}' is not recognized by foundation. Foundation will be bypassed.`);
  execRN(config.REACT_NATIVE_DIR, remaining);
} else {
  // An index.js is reuqired for the app to run
  if (!fs.existsSync('index.js')) {
    console.log('Entry point file not found. An `index.js` is required to start the react-native server');
    process.exit(1);
  }

  // Search for a workspace if there is one and use it as a root folder
  // otherwise consider the first folder to contain package.json as the
  // root folder
  let currentFolder = path.resolve('.');
  let workspaceFolder = null;
  do {
    const pkgFile = path.resolve(currentFolder, 'package.json');
    console.log(pkgFile);
    if (fs.existsSync(pkgFile)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgFile));
        if (pkg.workspaces) {
          if (workspaceFolder !== null) {
            // Make the workspaces definition matches our earlier assumption of workspace folder
            // Use this workspace folder only, if the workspaces definition matches
            if (pkg.workspaces.some((folder) => {
              // REmove all stars fromt the workspace definition
              const fromWorkspace = path.resolve(currentFolder, folder.split('*').join(''));
              return workspaceFolder.startsWith(`${fromWorkspace}/`);
            })) {
              workspaceFolder = currentFolder;
            } else {
              console.log('No match within workspace')
            }
          }

          // In any case, stop the search, as there can't be workspaces inside workspaces
          break;
        }
      } catch (err) {
        console.warn(`An invalid package.json file in ${currentFolder}`);
        console.error(err);
        break;
      }
    }

    // Consider the first folder to have package.json as the root folder
    // Unless another package.json is found on the parent structure which
    // is defined as workspace
    if (!workspaceFolder) {
      workspaceFolder = currentFolder;
    }

    // Move back one more folder
    const parentFolder = path.resolve(currentFolder, '..');
    if (parentFolder === currentFolder) {
      // We have reached the root folder
      break;
    }

    currentFolder = parentFolder;
  } while (true);

  // Set the workspace folder in the configuration
  config.WORKSPACE = workspaceFolder;

  // Also if react-native is available in the workspace, use the react-native
  // provided by the workspace
  if (fs.existsSync(path.resolve(config.WORKSPACE, 'node_modules', 'react-native', 'package.json'))) {
    // TODO: Check react-native versions
    config.REACT_NATIVE_DIR = config.WORKSPACE;
  }

  // Looks like the app has some configuration to share
  if (fs.existsSync('foundation.config.js')) {
    // TODO: Use the configuration
  }

  const args = commands[cmd](config);
  const finalArgs = [cmd].concat(remaining).concat(args);
  execRN(config.REACT_NATIVE_DIR, finalArgs);
}
