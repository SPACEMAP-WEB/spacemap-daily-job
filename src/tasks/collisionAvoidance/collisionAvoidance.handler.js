/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { EngineCommand, ShellCommand } = require('../../library');

class CollisionAvoidanceHandler {
  static async writePaths(parameters, remoteInputFilePrefix) {
    const {
      firstLineOfPrimary,
      secondLineOfPrimary,
      predictionEpochTime,
      startMomentOfCola,
      endMomentOfCola,
      amountOfLevel,
      numberOfPaths,
    } = parameters;
    const dirname = path.dirname(remoteInputFilePrefix);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
    const command = EngineCommand.getCandidatedPathsCommand(
      firstLineOfPrimary,
      secondLineOfPrimary,
      predictionEpochTime.toISOString(),
      startMomentOfCola,
      endMomentOfCola,
      amountOfLevel,
      numberOfPaths,
      remoteInputFilePrefix,
    );
    return ShellCommand.execCommandWithoutCheckingError(command);
  }

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
