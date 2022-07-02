/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const TleApiCall = require('./tles.call-api');
const TleHandler = require('./tles.handler');
const {
  SendEmailHandler,
  httpRequestHandler,
  DateHandler,
} = require('../../library');

/**
 * @typedef Date
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

class TleTask {
  static #SPACETRACK_URL = 'https://www.space-track.org';

  static #AUTH_URL = 'ajaxauth/login';

  static #QUERY_URL =
    'basicspacedata/query/class/gp/decay_date/null-val/EPOCH/%3Enow-30/MEAN_MOTION/%3E11.25/ECCENTRICITY/%3C0.25/orderby/NORAD_CAT_ID,EPOCH/format/3le';

  constructor() {
    this.name = 'TLE TASK';
    this.frequency = '0 0 0 * * *';
    this.excuting = false;
    this.handler = this.#tleScheduleHandler.bind(this);
  }

  /**
   * @param { Date } dateObj
   */
  async #tleScheduleHandler(dateObj) {
    if (this.excuting) {
      return;
    }
    console.log('tle scheduler start.');
    this.excuting = true;
    try {
      // 0. Check if today is tle clean day.
      if (DateHandler.isTleCleanDay()) {
        // await TleApiCall.deleteAllTle();
      }

      // 1. login spacetrack => get Accesstoken
      const loginCookie = await httpRequestHandler.getLoginCookie(
        `${this.#SPACETRACK_URL}/${this.#AUTH_URL}`,
        process.env.SPACETRACK
      );

      // 2. get plain texts from spacetrack.
      const tlePlainTexts = await httpRequestHandler.getContentsRequest(
        `${this.#SPACETRACK_URL}/${this.#QUERY_URL}`,
        loginCookie
      );

      // 3. parse tleplaintexts
      const { tles, newTlePlainTexts } = TleHandler.parse(
        dateObj,
        tlePlainTexts
      );

      // 4. update ID-NAME pairs
      await TleHandler.setIdNamePair(tles);

      // 5. send Tleplaintexts to ec2 server. => to local file
      await TleApiCall.sendTleFile(dateObj, newTlePlainTexts);

      // 6. send Models to ec2 server. => to DB
      await TleApiCall.sendTleModels(tles);

      console.log(`Save satellite TLE at : ${dateObj.formatString}`);
    } catch (err) {
      await SendEmailHandler.sendMail(
        '[SPACEMAP] tle task 에서 에러가 발생하였습니다.',
        err
      );
    } finally {
      this.excuting = false;
      console.log('tle scheduler finish.');
    }
  }
}

module.exports = TleTask;
