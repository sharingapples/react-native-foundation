const run = require('./_run');
const path = require('path');
const fs = require('fs');

module.exports = async function (config) {
  if (!config.ios.developerId) {
    throw new Error('Apple developer id (ios.developerId) needs to be defined in configuration');
  }

  const iosFolder = path.resolve(config.REACT_NATIVE_DIR, 'ios');
  const outputFolder = path.resolve(iosFolder, 'build');

  const scheme = config.ios.scheme || 'Foundation';

  // See if there is an ipa file to upload
  const ipaFile = path.resolve(outputFolder, `${scheme}.ipa`);
  if (!fs.existsSync(ipaFile)) {
    console.log(`ios app not found '${ipaFile}'`);
    throw new Error('Looks like app archive has not been created yet. Run `release-ios` to generate the ios app archive. Also note that the ipa file is removed after it\'s successfully uploaded');
  }

  const altool = '/Applications/Xcode.app/Contents/Applications/Application Loader.app/Contents/Frameworks/ITunesSoftwareService.framework/Support/altool';
  const args = [
    '--upload-app', '-f', ipaFile,
    '-u', config.ios.developerId,
  ];

  // Everything is looking great, time to upload
  // If developer password is available in the environment
  // use that
  const password = process.env.APPLE_DEVELOPER_PASS;
  if (password) {
    args.push('-p', password);
  }

  await run(altool, args, iosFolder);

  // Remove the ipa file if the upload was successful
  fs.unlinkSync(ipaFile);

  return null;
}
