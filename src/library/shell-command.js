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
    shell.mv(srcPath, destPath);
  }

  static async echoCommand(src, destPath) {
    const command = `${src} > ${destPath}`;
    shell.echo('-n', command);
  }
}

module.exports = ShellCommand;
