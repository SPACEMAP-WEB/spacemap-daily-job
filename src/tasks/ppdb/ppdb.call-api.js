const { httpRequestHandler } = require('../../library');

class PpdbApiCall {
  static #baseUrl = 'https://platform-api.spacemap42.com/ppdbs';

  static async deletePpdb() {
    const res = await httpRequestHandler.delete(this.#baseUrl);
    if (httpRequestHandler.fail(res)) {
      throw new Error('ppdb model delete failed.');
    }
  }

  static async sendPpdbPlainTexts(ppdbPlainTexts) {
    const res = await httpRequestHandler.post(`${this.#baseUrl}/texts`, {
      ppdbPlainTexts,
    });
    if (httpRequestHandler.fail(res)) {
      throw new Error('ppdb plain texts post failed.');
    }
  }
}

module.exports = PpdbApiCall;
