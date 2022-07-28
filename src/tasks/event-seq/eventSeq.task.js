/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const frequencies = require('../tasks-schedules');

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
    this.frequency = frequencies.eventSeqFrequency;
    // this.frequency = '* * * * * *';
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
      0,
    );
    const { year, month, date, hour } =
      DateHandler.getElementsOfDateObj(todaySameHourDateObj);
    const predictionCommandContext = EngineCommand.makePredictionCommandContext(
      tleFileName,
      year,
      month,
      date,
      hour,
    );

    try {
      // 1. update prediction window.
      await EventSeqRepository.setPredictionWindow(todaySameHourDateObj);
      console.log('1 end');
      // 2. remove existing eventSeq
      await EventSeqHandler.removeEventSeq();
      console.log('2 end');
      // 3. backup tle
      await EventSeqHandler.backupTle(ppdbFileName, tleFileName);
      console.log('3 end');
      // 4. put prediction command
      await EventSeqHandler.putPredictionCommand(predictionCommandContext);
      console.log('4 end');
      // 5. move tlefile
      await ShellCommand.moveCommand(tleLocalPath, tleEngineDirPath);

      // 6. event seq gen
      await EventSeqHandler.execEventSeqGen();
    } catch (err) {
      console.log(err);
      if (MODE !== 'TEST') {
        await SendEmailHandler.sendMail(
          '[SPACEMAP] eventSeq task 에서 에러가 발생하였습니다.',
          err,
        );
      }
    } finally {
      await EventSeqRepository.setPredictionWindow(todaySameHourDateObj);
      this.excuting = false;
      console.log('eventseq scheduler finish.');
    }
  }
}

module.exports = EventSeqTask;
