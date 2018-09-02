const { spawn } = require('child_process');

module.exports = function (cwd, args) {
  const rn = spawn('react-native', args, {
    cwd: cwd,
    stdio: ['inherit', 'inherit', 'inherit']
  });
}
