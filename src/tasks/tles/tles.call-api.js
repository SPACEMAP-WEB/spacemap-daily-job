const { httpRequestHandler } = require('../../library');

/**
 * @typedef DateObj
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

class TleApiCall {
  #baseUrl = 'https://platform-api.spacemap42.com/tles';

  /**
   * @param {[Object]} tlePlainTexts
   */
  static async sendTleModels(uniqueTleModels) {
    const res = await httpRequestHandler.post(this.#baseUrl, {
      tleModels: uniqueTleModels,
    });
    if (httpRequestHandler.fail(res)) {
      throw new Error('tle model post failed.');
    }
  }

  static async deleteAllTle() {
    const res = await httpRequestHandler.delete(this.#baseUrl);
    if (httpRequestHandler.fail(res)) {
      throw new Error('tle model delete failed.');
    }
  }

  /**
   * @param {DateObj} dateObj
   */
  static async sendTlePlainTexts(dateObj, newTlePlainTexts) {
    const res = await httpRequestHandler.post(`${this.#baseUrl}/texts`, {
      fileName: dateObj.formatString,
      tlePlainTexts: newTlePlainTexts,
    });
    if (httpRequestHandler.fail(res)) {
      throw new Error('tle plain texts post failed.');
    }
  }
}

module.exports = TleApiCall;
