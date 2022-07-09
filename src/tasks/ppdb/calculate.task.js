// /* eslint-disable class-methods-use-this */
// /* eslint-disable no-console */
// /* eslint-disable no-unused-vars */

// const moment = require('moment');
// const { DateHandler, EngineCommand } = require('../../library');

// /**
//  * @typedef DateObj
//  * @property { String } formatString
//  * @property { moment.Moment } obj
//  */

// class EventSeqTask {
//   #FROM_PPDB_PATH = '/data/COOP/workingFolder/PPDB2.txt';

//   constructor() {
//     this.name = 'EVENT TASK';
//     this.period = '0 5 15 * * *';
//     this.excuting = false;
//     this.handler = this.#EventSeqHandler.bind(this);
//   }

//   /**
//    * @param {DateObj} dateObj
//    * @returns
//    */
//   async #EventSeqHandler(dateObj) {
//     if (this.excuting) {
//       return;
//     }
//     this.excuting = true;
//     console.log('eventseq scheduler start.');

//     const ppdbFileName = `${dateObj.formatString}.txt`;
//     const tlePath = `public/tle/${currDateFileName}.tle`;
//     const tleFileName = `${currDateFileName}.tle`;

//     const tomorrow = moment().add(0, 'd').startOf('hour');
//     const year = tomorrow.year();
//     const month = tomorrow.month() + 1;
//     const date = tomorrow.date();
//     const hour = tomorrow.hour();
//     // --------------------------calculate PPDB----------------------------//
//     try {
//       const predictionCommand = EngineCommand.makePredictionCommandContext(
//         tleFileName,
//         year,
//         month,
//         date,
//         hour
//       );
//       DateHandler.setStartMomentOfPredictionWindow(tomorrow.toISOString());
//       DateHandler.setEndMomentOfPredictionWindow(
//         tomorrow.clone().add(2, 'd').toISOString()
//       );
//       await PpdbHandler.sshRemoveEventSeq();
//       await PpdbHandler.sshBackupTle(ppdbFileName, tleFileName);
//       await PpdbHandler.sshPutPredictionCommand(predictionCommand);
//       await this.sftpHandler.putFile(
//         tlePath,
//         `${EngineCommand.homeDirectory}${tleFileName}`
//       );
//       console.log(predictionCommand);
//       await PpdbHandler.sshExecEvetnSeqGen();
//       // await PpdbHandler.sshExecCalculatePpdb();
//     } catch (err) {
//       console.log(err);
//     } finally {
//       console.log('making ppdb is finished.');
//       DateHandler.setStartMomentOfPredictionWindow(tomorrow.toISOString());
//       DateHandler.setEndMomentOfPredictionWindow(
//         tomorrow.clone().add(2, 'd').toISOString()
//       );
//       console.log(`${new Date()}`);
//       console.log('eventseq scheduler finish.');
//       this.excuting = false;
//     }
//     // --------------------------calculate PPDB----------------------------//
//   }
// }
// module.exports = EventseqTask;
