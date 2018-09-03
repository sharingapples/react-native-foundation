const { spawn } = require('child_process');

module.exports = function run(cmd, args, cwd, err) {
  const errFn = err || (code => new Error(`Command ${cmd} failed with error code ${code}`));
  return new Promise((resolve, reject) => {
    const ch = spawn(cmd, args, {
      cwd,
      stdio: ['inherit', 'inherit', 'inherit'],
    });

    ch.on('exit', (code) => {
      if (code === 0) {
        return resolve(true);
      }

      return reject(errFn(code));
    });
  });
};
