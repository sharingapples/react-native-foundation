const { spawn } = require('child_process');

module.exports = function(file, cmd) {
  return new Promise((resolve, reject) => {
    const args = [
      '-c',
      cmd,
      file
    ];
    const buddy = spawn('/usr/libexec/PlistBuddy', args);
    buddy.on('exit', (code) => {
      if (code === 0) {
        resolve(true);
      }

      resolve(code);
    });
  });
}
