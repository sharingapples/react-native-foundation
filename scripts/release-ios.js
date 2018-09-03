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


  // Generate archive
  const outputFolder = path.resolve(iosFolder, 'build');
  const archivePath = path.resolve(outputFolder, 'Foundation-archive');
  await run('xcodebuild', [
    '-workspace', 'Foundation.xcworkspace',
    '-scheme', 'Foundation',
    '-configuration', 'Release',
    `DEVELOPMENT_TEAM=${config.ios.teamId}`,
    '-sdk', 'iphoneos',
    'archive', '-archivePath', archivePath,
  ], iosFolder);


  // Generate ips file
  await run('xcodebuild', [
    '-exportArchive', '-archivePath', `${archivePath}.xcarchive`,
    '-exportOptionsPlist', exportOptionsFile,
    '-exportPath', outputFolder,
    '-allowProvisioningUpdates'
  ], iosFolder);

  return null;
}
