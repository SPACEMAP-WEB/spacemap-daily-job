/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const PpdbHandler = require('./ppdb.handler');
const PpdbApiCall = require('./ppdb.call-api');
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
    this.frequency = '0 5 23 * * *';
    this.excuting = false;
    this.handler = this.#ppdbScheduleHandler.bind(this);
  }

  async #ppdbScheduleHandler(dateObj, MODE) {
    if (this.excuting || !TleHandler.isPairsSetMoreThanOnce()) {
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
        ppdbPlainTexts
      );

      if (MODE === 'TEST') {
        console.log(ppdbModelArray);
      } else {
        // 2. send ppdb plain texts to ec2 server => save on local file
        await PpdbApiCall.sendPpdbPlainTexts(ppdbPlainTexts);

        // 3. send array of ppdb model to ec2 server
        //    => ec2 server should delete all existing row.
        //    => then, save this models.
        await PpdbApiCall.sendPpdbModel(ppdbModelArray);
      }
      console.log(`Save PPDB at: ${dateObj}`);
    } catch (err) {
      if (MODE === 'TEST') {
        console.log(err);
      } else {
        await SendEmailHandler.sendMail(
          '[SPACEMAP] ppdb task 에서 에러가 발생하였습니다.',
          err
        );
      }
    } finally {
      console.log('ppdb scheduler finish.');
      this.excuting = false;
    }
  }
}

module.exports = PpdbTask;
