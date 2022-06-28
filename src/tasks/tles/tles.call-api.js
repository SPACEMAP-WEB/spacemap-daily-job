const { httpRequestHandler } = require('../../library');
const TleHandler = require('./tles.handler');

/**
 * @typedef DateObj
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

class TleApiCall {
  #baseUrl = 'https://platform-api.spacemap42.com/tles';

  /**
   * @param {DateObj} date
   * @param {[Object]} tlePlainTexts
   */
  static async sendTleModels(date, tlePlainTexts) {
    const tleObjs = TleHandler.parse(date, tlePlainTexts);
    const res = await httpRequestHandler.post(`${this.#baseUrl}`, {
      tleObjs,
    });
    if (!res || res.statusCode / 100 !== 2) {
      throw new Error('tle model post failed.');
    }
  }

  static async deleteAllTle() {
    // TODO: 구현
  }

  static async sendTleFile(date, tlePlainTexts) {
    // TODO: 구현
  }
}

module.exports = TleApiCall;
