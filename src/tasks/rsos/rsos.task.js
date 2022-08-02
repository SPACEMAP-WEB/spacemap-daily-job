/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const frequencies = require('../tasks-schedules');
const RsosRepository = require('./rsos.repository');
const RsoHandler = require('./rsos.handler');
const { SendEmailHandler, httpRequestHandler } = require('../../library');

/**
 * @typedef Date
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

class RsosTask {
  #SPACETRACK_URI = 'https://www.space-track.org';

  #AUTH_URI = 'ajaxauth/login';

  #QUERY_URI =
    'basicspacedata/query/class/gp/orderby/NORAD_CAT_ID,EPOCH/format/xml';

  constructor() {
    this.name = 'RSO-PARAMS TASK';
    this.frequency = frequencies.rsosFrequency;
    this.excuting = false;
    this.handler = this.#rsosScheduleHandler.bind(this);
  }
  /**
   * @param { Date } dateObj
   */

  async #rsosScheduleHandler(dateObj, MODE) {
    if (this.excuting) {
      return;
    }
    console.log('rsos scheduler start.');
    this.excuting = true;
    try {
      // 1. login spacetrack => get Accesstoken
      const loginCookie = await httpRequestHandler.getLoginCookie(
        `${this.#SPACETRACK_URI}/${this.#AUTH_URI}`,
        process.env.SPACETRACK,
      );
      console.log('RSO #1');
      // 2. get plain texts from spacetrack.
      const rsoParamsPlainText = await httpRequestHandler.getContentsRequest(
        `${this.#SPACETRACK_URI}/${this.#QUERY_URI}`,
        loginCookie,
      );

      console.log('RSO #2');
      // 3. parse tleplaintexts
      const rsoJson = RsoHandler.parseRsoXml(rsoParamsPlainText);
      const rsoParamsArray = RsoHandler.getRsoParamArrays(rsoJson);

      console.log('RSO #3');
      // 4. update ID-NAME pairs
      await RsosRepository.updateRsoParams(rsoParamsArray);
      console.log('RSO #4');
    } catch (err) {
      console.log(err);
      if (MODE !== 'TEST') {
        await SendEmailHandler.sendMail(
          '[SPACEMAP] rso-params task 에서 에러가 발생하였습니다.',
          err,
        );
      }
    } finally {
      this.excuting = false;
      console.log('rsos scheduler finish.');
    }
  }
}

module.exports = RsosTask;
