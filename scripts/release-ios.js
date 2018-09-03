const fs = require('fs');
const path = require('path');

const buildIos = require('./_build-ios');
const getBuildFolder = require('./_getBuildFolder');
const Buddy = require('./_PlistBuddy');
const run = require('./_run');

module.exports = async function (config, package) {
  if (!config.ios.teamId) {
    throw new Error('A 10 character apple developer team id is required for releasing an ios app');
  }

  const scheme = config.ios.scheme || 'Foundation';

  // Generate a exportOptions.plist file
  const buildFolder = getBuildFolder(config);
  const exportOptionsFile = path.resolve(buildFolder, 'exportOptions.plist');

  // Create export options file
  if (fs.existsSync(exportOptionsFile)) fs.unlinkSync(exportOptionsFile);

  // Add the keys
  await Buddy(exportOptionsFile, `ADD :teamID string ${config.ios.teamId}`);
  await Buddy(exportOptionsFile, `ADD :method string app-store`);

  // Build ios configurations
  await buildIos(config, package);

  const iosFolder = path.resolve(config.REACT_NATIVE_DIR, 'ios');

  // Workspace may not be always available, fall back to
  // project in that case
  const workspace = `${scheme}.xcworkspace`;
  const options = [];
  if (!fs.existsSync(path.resolve(iosFolder, workspace))) {
    options.push('-project', `${scheme}.xcodeproj`);
  } else {
    options.push('-workspace', workspace);
  }
  // Generate archive
  const outputFolder = path.resolve(iosFolder, 'build');
  const archivePath = path.resolve(outputFolder, `${scheme}-archive`);
  await run('xcodebuild', options.concat([
    '-scheme', `${scheme}`,
    '-configuration', 'Release',
    `DEVELOPMENT_TEAM=${config.ios.teamId}`,
    '-sdk', 'iphoneos',
    'archive', '-archivePath', archivePath,
  ]), iosFolder);


  // Generate ips file
  await run('xcodebuild', [
    '-exportArchive', '-archivePath', `${archivePath}.xcarchive`,
    '-exportOptionsPlist', exportOptionsFile,
    '-exportPath', outputFolder,
    '-allowProvisioningUpdates'
  ], iosFolder);

  return null;
}
