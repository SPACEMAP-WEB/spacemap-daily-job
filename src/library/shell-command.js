const shell = require('shelljs');

class ShellCommand {
  static async execCommand(rawCommand) {
    const command = `${rawCommand} > /dev/null 2>&1  && echo $?`;
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

  static async execCommandWithoutCheckingError(rawCommand) {
    const command = `${rawCommand} > /dev/null 2>&1  && echo $?`;
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
    shell.mv(srcPath, destPath);
  }
}

module.exports = ShellCommand;
