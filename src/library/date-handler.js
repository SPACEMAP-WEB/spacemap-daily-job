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

  static getPpdbTime(
    year,
    month,
    date,
    hours,
    min,
    sec,
    tca,
    tcaStart,
    tcaEnd
  ) {
    const standardTime = moment(
      `${year}-${month}-${date}T${hours}:${min}:${
        sec >= 60.0 ? sec - 0.001 : sec
      }Z`,
      'YYYY-MM-DDTHH:mm:ss.SSSSZ'
    );
    const diffTcaStart = tcaStart > tca ? tcaStart - tcaStart : tcaStart - tca;
    const diffTcaEnd = tcaEnd < tca ? tcaEnd - tcaEnd : tcaEnd - tca;
    const tcaStartTime = standardTime.clone().add(diffTcaStart, 'seconds');
    const tcaTime = standardTime.clone().add(0, 'seconds');
    const tcaEndTime = standardTime.clone().add(diffTcaEnd, 'seconds');

    return {
      standardTime: standardTime.toDate(),
      tcaTime: tcaTime.toDate(),
      tcaStartTime: tcaStartTime.toDate(),
      tcaEndTime: tcaEndTime.toDate(),
    };
  }
}

module.exports = DateHandler;
