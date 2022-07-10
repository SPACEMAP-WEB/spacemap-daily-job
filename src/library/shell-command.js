const shell = require('shelljs');

class ShellCommand {
  static async execCommand(rawCommand) {
    const command = `${rawCommand} > /dev/null && echo $?`;
    const res = shell.exec(command, {
      silent: true,
    });
    if (!res) {
      throw new Error(`Shell exec : ${command} failed.`);
    }
    const { code } = res;
    if (code !== 0) {
      throw new Error(`Shell exec : ${command} failed.`);
    }
  }

  static async moveCommand(srcPath, destPath) {
    shell.cp(srcPath, destPath);
  }
}

module.exports = ShellCommand;
