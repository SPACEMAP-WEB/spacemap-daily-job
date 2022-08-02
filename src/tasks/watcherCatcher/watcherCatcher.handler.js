const moment = require('moment');
const fs = require('fs');
const path = require('path');
const {
  EngineCommand,
  asyncWriteFile,
  ShellCommand,
} = require('../../library');

class WatcherCatcherHandler {
  static async writeParameters(
    parameters,
    remoteInputFilePath,
    remoteOutputFilePath,
  ) {
    const {
      //   _latitude,
      //   _longitude,
      localX,
      localY,
      localZ,
      altitude,
      fieldOfView,
      epochTime,
      endTime,
      //   _predictionEpochTime,
      //   _threshold,
    } = parameters;
    const dirname = path.dirname(remoteInputFilePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
    const paramtersText = await this.makeParametersToText(
      remoteInputFilePath,
      epochTime,
      endTime,
      localX,
      localY,
      localZ,
      altitude,
      fieldOfView,
      remoteOutputFilePath,
    );
    await asyncWriteFile(remoteInputFilePath, paramtersText);
  }

  static async makeParametersToText(
    remoteInputFilePath,
    epochTime,
    endTime,
    x,
    y,
    z,
    altitude,
    fieldOfView,
    remoteOutputFilePath,
  ) {
    const juliaPath =
      '/data/COOP/InterfaceForExternalLib/Julia/CoordinateConversion.jl';
    // let epochTimeOfWatchWindow = [year, month, date, hours, minutes, seconds];
    const momentEpochTime = moment(epochTime);
    const momentEndTime = moment(endTime);
    const year = momentEpochTime.year();
    const month = momentEpochTime.month() + 1;
    const date = momentEpochTime.date();
    const hours = momentEpochTime.hours();
    const minutes = momentEpochTime.minutes();
    const seconds = momentEpochTime.seconds();
    const watchWindowLength = momentEndTime.diff(momentEpochTime, 'seconds'); // sec
    const inteferenceRadius = 100; // km
    const cameraAngle = fieldOfView;
    const timeIncrement = 10; // sec
    return `${remoteInputFilePath} ${juliaPath} ${year} ${month} ${date} ${hours} ${minutes} ${seconds} ${watchWindowLength} 0 ${altitude} ${inteferenceRadius} ${cameraAngle} ${timeIncrement} ${x} ${y} ${z} ${remoteOutputFilePath}`;
  }

  static makeFilePath(email) {
    const uniqueSuffix = `${moment().format('YYYY-MM-DD-hh:mm:ss')}`;
    const filename = `${email}-WC-${uniqueSuffix}.txt`;
    const remoteFolder = `${EngineCommand.homeDirectory}${email}/`;
    return {
      remoteFolder,
      remoteInputFilePath: `${remoteFolder}${filename}`,
      remoteOutputFilePath: `${remoteFolder}out_${filename}`,
      localOutputPath: `public/uploads/out_${filename}`,
    };
  }

  static async createdWcdbFile(remoteInputFilePath) {
    const command = EngineCommand.getWatcherCatcherCommand(remoteInputFilePath);
    console.log(command);
    await ShellCommand.execCommandWithoutCheckingError(command);
  }
}

module.exports = WatcherCatcherHandler;
