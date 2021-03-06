/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const frequencies = require('../tasks-schedules');

const PpdbHandler = require('./ppdb.handler');
const PpdbRepository = require('./ppdb.repository');
const TleHandler = require('../tles/tles.handler');
const { SendEmailHandler } = require('../../library');

/**
 * @typedef Date
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

class PpdbTask {
  constructor() {
    this.name = 'PPDB TASK';
    this.frequency = frequencies.ppdbFrequency;
    // this.frequency = '* * * * * *';
    this.excuting = false;
    this.handler = this.#ppdbScheduleHandler.bind(this);
  }

  async #ppdbScheduleHandler(dateObj, MODE) {
    if (this.excuting) {
      return;
    }
    this.excuting = true;
    console.log('ppdb scheduler start.');
    try {
      // 0. read ppdb file from local
      const ppdbPlainTexts = await PpdbHandler.readPpdbFile();

      // 1. parse ppdb file and get array of ppdb model.
      const ppdbModelArray = await PpdbHandler.getPpdbModelArray(
        dateObj,
        ppdbPlainTexts,
      );

      if (MODE === 'TEST') {
        console.log(ppdbModelArray);
      } else {
        // 2. save ppdb models on db
        await PpdbRepository.savePpdbModelsOnDB(ppdbModelArray);
        console.log(`Save PPDB at: ${dateObj.formatString}`);
      }
    } catch (err) {
      console.log(err);
      if (MODE !== 'TEST') {
        await SendEmailHandler.sendMail(
          '[SPACEMAP] ppdb task 에서 에러가 발생하였습니다.',
          err,
        );
      }
    } finally {
      console.log('ppdb scheduler finish.');
      this.excuting = false;
    }
  }
}

module.exports = PpdbTask;
