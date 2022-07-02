const fs = require('fs');
const { promisify } = require('util');

const asyncReadFile = promisify(fs.readFile);
const asyncWriteFile = promisify(fs.writeFile);

module.exports = {
  asyncReadFile,
  asyncWriteFile,
};
