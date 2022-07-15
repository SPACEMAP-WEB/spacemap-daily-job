const { EngineCommand, ShellCommand } = require('../../library');

class LcaHandler {
  static async createLpdbFile(
    remoteInputFilePath,
    remoteOutputFilePath,
    threshold
  ) {
    const command = EngineCommand.getLaunchCojunctionsAssessmentCommand(
      remoteInputFilePath,
      remoteOutputFilePath,
      threshold
    );
    return ShellCommand.execCommand(command);
  }
}

module.exports = LcaHandler;
