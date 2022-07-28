const { EngineCommand, ShellCommand } = require('../../library');

class CollisionAvoidanceHandler {
  static async createdColadbFile(
    remoteInputFileListPath,
    remoteOutputFilePath,
    threshold,
  ) {
    const command = EngineCommand.getCollisionAvoidanceCommand(
      remoteInputFileListPath,
      remoteOutputFilePath,
      threshold,
    );
    console.log(command);
    await ShellCommand.execCommandWithoutCheckingError(command);
  }
}

module.exports = CollisionAvoidanceHandler;
