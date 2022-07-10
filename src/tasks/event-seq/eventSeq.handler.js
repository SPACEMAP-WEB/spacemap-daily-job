const {
  EngineCommand,
  ShellCommand,
  asyncWriteFile,
} = require('../../library');

class EventSeqHandler {
  static async removeEventSeq() {
    const removeTarget1 = `${EngineCommand.homeDirectory}EVENTSEQ`;
    const removeTarget2 = `${EngineCommand.homeDirectory}Su*`;
    const mkdirTarget = `${EngineCommand.homeDirectory}EVENTSEQ`;
    const command = `rm -rf ${removeTarget1} && rm -rf ${removeTarget2} && mkdir ${mkdirTarget}`;
    return ShellCommand.execCommand(command);
  }

  static async backupTle(ppdbFile) {
    const moveSrcPpdb = `${EngineCommand.homeDirectory}PPDB2.txt`;
    const moveDestPpdb = `${EngineCommand.homeDirectory}2022/PPDB${ppdbFile}`;
    const moveSrcTle = `${EngineCommand.homeDirectory}*.tle`;
    const moveDestTle = `${EngineCommand.homeDirectory}2022/`;

    await ShellCommand.moveCommand(moveSrcPpdb, moveDestPpdb);
    await ShellCommand.moveCommand(moveSrcTle, moveDestTle);
  }

  static async putPredictionCommand(predictionCommand) {
    return asyncWriteFile(EngineCommand.predictionCommand, predictionCommand);
  }

  static async execEventSeqGen() {
    const eventCommand = EngineCommand.getEventSeqGenCommand();
    const ppdbCommand = EngineCommand.getCaculatePpdbCommand();
    const command = `${eventCommand} > /dev/null && ${ppdbCommand}`;
    return ShellCommand.execCommand(command);
  }
}

module.exports = EventSeqHandler;
