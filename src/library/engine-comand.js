class EngineCommand {
  static engine = '/home/coop/COOP/COOPLauncher_LNX.out';

  static homeDirectory = '/data/COOP/workingFolder/';

  static eventSeqDirectory = `${this.homeDirectory}EVENTSEQ`;

  static predictionCommand = `${this.homeDirectory}Prediction_Command.txt`;

  static maximumCores = 255;

  static startMomentOfPredictionWindow;

  static makePredictionCommandContext(tleFileName, year, month, date, hour) {
    const resolution = 100;
    const predictionWindowLength = 172800;
    // const predictionWindowLength = 3600;
    const predictionCommandContext = `${this.homeDirectory} ${tleFileName} 0 ${resolution} 1.0e-3 ${predictionWindowLength} ${year} ${month} ${date} ${hour} 0 0`;
    return predictionCommandContext;
  }

  static getEventSeqGenCommand() {
    const threshold = 10;
    return `${this.engine} ${this.predictionCommand} EVENTSEQGEN 0 ${this.maximumCores} ${threshold} -1`;
  }

  static getCaculatePpdbCommand() {
    const threshold = 10;
    return `${this.engine} ${this.predictionCommand} PROXDBGEN2 0 ${this.maximumCores} ${threshold} -1`;
  }

  static getLaunchCojunctionsAssessmentCommand(
    inputFilePath,
    outputFilePath,
    threshold,
  ) {
    return `${this.engine} ${this.predictionCommand} PHANPROP 0 ${this.maximumCores} ${threshold} ${inputFilePath} ${outputFilePath}`;
  }

  static getWatcherCatcherCommand(paramFilePath) {
    return `${this.engine} ${this.predictionCommand} INTERFERENCE 0 ${this.maximumCores} ${paramFilePath}`;
  }

  static getCandidatedPathsCommand(
    firstLine,
    secondLine,
    predictionEpochTime,
    startMomentOfCola,
    endMomentOfCola,
    amountOfLevel,
    numberOfPaths,
    filePrefix,
  ) {
    return `python3 spacemap-assistant-tool/tle2offset_path.py "${firstLine}" "${secondLine}" ${predictionEpochTime} ${startMomentOfCola} ${endMomentOfCola} ${amountOfLevel} ${numberOfPaths} ${filePrefix}`;
  }

  static getCollisionAvoidanceCommand(
    inputFileListPath,
    outputFilePath,
    threshold,
  ) {
    return `${this.engine}   ${this.predictionCommand} PHANPROP2 0 ${this.maximumCores} ${threshold} ${inputFileListPath} ${outputFilePath}`;
    // "args": ["Prediction_Command.txt", "PHANPROP2", "0", "256", "100", "/data/COOP/launchTrajectory/trajectory.lst", "output_launch_trajectory_NEW_ORBITTOOLS.txt"],
  }
}

module.exports = EngineCommand;
