const path = require('path');
const fs = require('fs');

module.exports = async function (config) {
  if (!config.WORKSPACE) {
    throw new Error(`You don't have a workspace to create .gitignore file`);
  }

  const targetFile = path.resolve(config.WORKSPACE, '.gitignore');
  if (fs.existsSync(targetFile)) {
    throw new Error(`A .gitignore file already exists on your workspace. Cannot replace existing file.`);
  }

  const srcFile = path.resolve(__dirname, '..', '.gitignore');
  const src = fs.readFileSync(srcFile, 'utf-8');
  fs.writeFileSync(targetFile, src, 'utf-8');
  console.log(`Created ${targetFile}`);
  return null;
}