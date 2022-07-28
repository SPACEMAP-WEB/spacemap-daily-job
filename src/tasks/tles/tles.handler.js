const {
  StringHandler,
  DateHandler,
  httpRequestHandler,
} = require('../../library');

/**
 * @typedef DateObj
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

const idNamePairs = new Map();

let setPairsMoreThanOnce = false;

class TleHandler {
  static #isValidFirstLine(firstLine) {
    const firstLineArray = firstLine.split(/[ \t]+/);
    if (!firstLineArray || firstLineArray.length < 3) {
      return undefined;
    }
    const stringId = firstLineArray[1].replace('U', '');
    return stringId;
  }

  static #isVaild(name, firstLine, secondLine) {
    return (
      StringHandler.isValidString(name) &&
      StringHandler.isValidString(firstLine) &&
      StringHandler.isValidString(secondLine)
    );
  }

  /**
   * @param {DateObj} dateObj
   * @param {String} tlePlainTexts
   * @returns {[Object]}
   */
  static parse(dateObj, tlePlainTexts) {
    const tleArray = tlePlainTexts.split(/[\r\n]+/);
    const tles = [];
    const newTlePlainTextArray = [];
    const tleArrayLength = tleArray.length;
    const uniqueDict = new Map();
    const date = DateHandler.getDateOfParam(dateObj.formatString).obj.toDate();
    for (let i = 0; i < tleArrayLength; i += 3) {
      const name = tleArray[i].slice(2, tleArray[i].length);
      const firstline = tleArray[i + 1];
      const secondline = tleArray[i + 2];
      if (this.#isVaild(name, firstline, secondline)) {
        const stringId = this.#isValidFirstLine(firstline);
        if (stringId && StringHandler.isNumeric(stringId)) {
          const id = Number(stringId);
          if (!uniqueDict.get(id)) {
            uniqueDict.set(id, 10);
            tles.push({
              date,
              id,
              name,
              firstline,
              secondline,
            });
            newTlePlainTextArray.push(
              `0 ${name}\r\n${firstline}\r\n${secondline}\r\n`,
            );
          }
        }
      }
    }
    return {
      tles,
      newTlePlainTexts: newTlePlainTextArray.join(''),
    };
  }

  static setIdNamePair(tles) {
    idNamePairs.clear();
    setPairsMoreThanOnce = true;
    tles.forEach((tle) => {
      const { id, name } = tle;
      idNamePairs.set(id, name);
    });
  }

  static async getNameByUsingId(id) {
    if (!setPairsMoreThanOnce) {
      const SPACETRACK_URI = 'https://www.space-track.org';

      const AUTH_URI = 'ajaxauth/login';

      const QUERY_URI =
        'basicspacedata/query/class/gp/decay_date/null-val/EPOCH/%3Enow-30/MEAN_MOTION/%3E11.25/ECCENTRICITY/%3C0.25/orderby/NORAD_CAT_ID,EPOCH/format/3le';

      const loginCookie = await httpRequestHandler.getLoginCookie(
        `${SPACETRACK_URI}/${AUTH_URI}`,
        process.env.SPACETRACK,
      );

      const tlePlainTexts = await httpRequestHandler.getContentsRequest(
        `${SPACETRACK_URI}/${QUERY_URI}`,
        loginCookie,
      );

      const { tles } = TleHandler.parse(
        DateHandler.getDateOfToday(),
        tlePlainTexts,
      );

      TleHandler.setIdNamePair(tles);
    }
    return idNamePairs.get(id) || 'UNKNOWN';
  }

  static isPairsSetMoreThanOnce() {
    return setPairsMoreThanOnce;
  }
}

module.exports = TleHandler;
