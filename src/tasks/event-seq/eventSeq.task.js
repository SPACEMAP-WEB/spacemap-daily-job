/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const {
  DateHandler,
  EngineCommand,
  SendEmailHandler,
  ShellCommand,
} = require('../../library');
const EventSeqHandler = require('./eventSeq.handler');
const EventSeqRepository = require('./eventSeq.repository');

/**
 * @typedef DateObj
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

class EventSeqTask {
  constructor() {
    this.name = 'EVENT TASK';
    this.period = '0 5 15 * * *';
    this.excuting = false;
    this.handler = this.#EventSeqScheduleHandler.bind(this);
  }

  /**
   * @param {DateObj} dateObj
   * @returns
   */
  async #EventSeqScheduleHandler(dateObj, MODE) {
    if (this.excuting) {
      return;
    }
    this.excuting = true;
    console.log('eventseq scheduler start.');

    const currentFileName = dateObj.formatString;
    const ppdbFileName = `${currentFileName}.txt`;
    const tleFileName = `${currentFileName}.tle`;
    const tleLocalPath = `./public/tles/${tleFileName}`;
    const tleEngineDirPath = `${EngineCommand.homeDirectory}${tleFileName}`;
    const todaySameHourDateObj = DateHandler.getDateOfSameHourNextDay(
      dateObj,
      0
    );
    const { year, month, date, hour } =
      DateHandler.getElementsOfDateObj(todaySameHourDateObj);
    const predictionCommandContext = EngineCommand.makePredictionCommandContext(
      tleFileName,
      year,
      month,
      date,
      hour
    );

    try {
      // 1. update prediction window.
      await EventSeqRepository.setPredictionWindow(todaySameHourDateObj);

      // 2. remove existing eventSeq
      await EventSeqHandler.removeEventSeq();

      // 3. backup tle
      await EventSeqHandler.backupTle(ppdbFileName, tleFileName);

      // 4. put prediction command
      await EventSeqHandler.putPredictionCommand(predictionCommandContext);

      // 5. move tlefile
      await ShellCommand.moveCommand(tleLocalPath, tleEngineDirPath);

      // 6. event seq gen
      await EventSeqHandler.execEventSeqGen();
    } catch (err) {
      console.log(err);
      if (MODE !== 'TEST') {
        await SendEmailHandler.sendMail(
          '[SPACEMAP] eventSeq task 에서 에러가 발생하였습니다.',
          err
        );
      }
    } finally {
      await EventSeqRepository.setPredictionWindow(todaySameHourDateObj);
      console.log('eventseq scheduler finish.');
      this.excuting = false;
    }
  }
}

module.exports = EventSeqTask;
