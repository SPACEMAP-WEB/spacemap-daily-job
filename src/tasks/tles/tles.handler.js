const { StringHandler } = require('../../library');

/**
 * @typedef DateObj
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

class TleHandler {
  static #isValidId(firstLine) {
    const firstLineArray = firstLine.split(/[ \t]+/);
    if (!firstLineArray || firstLineArray.length < 3) {
      return false;
    }
    const stringId = firstLineArray[1].replace('U', '');
    return StringHandler.isNumeric(stringId);
  }

  static #isVaild(name, firstLine, secondLine) {
    return (
      StringHandler.isValidString(name) &&
      StringHandler.isValidString(firstLine) &&
      StringHandler.isValidString(secondLine)
    );
  }

  /**
   * @param {DateObj} date
   * @param {String} tlePlainTexts
   * @returns {[Object]}
   */
  static parse(date, tlePlainTexts) {
    const tleArray = tlePlainTexts.split(/[\r\n]+/);
    const tleArrayLength = tleArray.length;
    const tles = [];
    for (let i = 0; i < tleArrayLength; i += 3) {
      const name = tleArray[i].slice(2, tleArray[i].length);
      const firstline = tleArray[i + 1];
      const secondline = tleArray[i + 2];
      if (this.#isVaild(name, firstline, secondline)) {
        if (this.#isValidId(firstline))
          tles.push({
            date: date.obj.toDate(),
            id: Number(firstline),
            name,
            firstline,
            secondline,
          });
      }
    }
    return tles;
  }
}

module.exports = TleHandler;
