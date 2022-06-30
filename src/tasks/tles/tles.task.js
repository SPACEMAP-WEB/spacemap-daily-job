/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const { DateHandler, SendEmailHandler } = require('../../library');
const httpRequestHandler = require('../../library/httpRequest');
const TleApiCall = require('./tles.call-api');
const TleHandler = require('./tles.handler');

/**
 * @typedef Date
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

class TleTask {
  #SPACETRACK_URL = 'https://www.space-track.org';

  #AUTH_URL = 'ajaxauth/login';

  #QUERY_URL =
    'basicspacedata/query/class/gp/decay_date/null-val/EPOCH/%3Enow-30/MEAN_MOTION/%3E11.25/ECCENTRICITY/%3C0.25/orderby/NORAD_CAT_ID,EPOCH/format/3le';

  constructor() {
    this.name = 'TLE TASK';
    this.frequency = '* * * * * *';
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
      // if (DateHandler.isTleCleanDay()) {
      //   await TleApiCall.deleteAllTle();
      // }

      // 1. login spacetrack
      const loginCookie = await httpRequestHandler.getLoginCookie(
        `${this.#SPACETRACK_URL}/${this.#AUTH_URL}`,
        process.env.SPACETRACK
      );
      console.log(loginCookie);

      // 2. get plain texts from spacetrack.
      const tlePlainTexts = await httpRequestHandler.getContentsRequest(
        `${this.#SPACETRACK_URL}/${this.#QUERY_URL}`,
        loginCookie
      );

      // 3. get unique id tle Model
      const { tles, newTlePlainTexts } = TleHandler.parse(
        dateObj,
        tlePlainTexts
      );

      console.log(tles);
      console.log(newTlePlainTexts);
      // // 4. send Models to ec2 server.
      // await TleApiCall.sendTleModels(tles);

      // // 5. send Tle File to ec2 server.
      // await TleApiCall.sendTleFile(dateObj, newTlePlainTexts);

      console.log(`Save satellite TLE at : ${dateObj.formatString}`);
    } catch (err) {
      console.log(err);
      // await SendEmailHandler.sendMail(
      //   '[SPACEMAP] tle task 에서 에러가 발생하였습니다.',
      //   err
      // );
    } finally {
      this.excuting = false;
      console.log('tle scheduler finish.');
    }
  }
}

module.exports = TleTask;
