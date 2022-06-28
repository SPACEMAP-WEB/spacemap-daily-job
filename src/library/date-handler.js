const moment = require('moment');

/**
 * @typedef DateObj
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

class DateHandler {
  static #format = 'YYYY-MM-DD-hh';

  static #isValidFormat(momentDate) {
    return momentDate.isValid();
  }

  /** @returns { DateObj } */
  static getDateOfToday() {
    const today = moment();
    return {
      obj: today,
      formatString: today.format(this.#format),
    };
  }

  /**
   * @param { String } formatString
   * @returns { undefined | DateObj }
   */
  static getDateOfParam(formatString) {
    const obj = moment(formatString, this.#format);
    if (this.#isValidFormat(obj) === false) {
      return undefined;
    }
    return {
      obj,
      formatString,
    };
  }

  static isTleCleanDay() {
    const { obj: dateObj } = this.getDateOfToday();
    return dateObj.date === 0 && dateObj.day === 0;
  }
}

module.exports = DateHandler;
