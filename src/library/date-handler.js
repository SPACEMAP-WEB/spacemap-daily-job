const moment = require('moment');

/**
 * @typedef DateObj
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

const format = 'YYYY-MM-DD-hh';

class DateHandler {
  static #isValidFormat(momentDate) {
    return momentDate.isValid();
  }

  /** @returns { DateObj } */
  static getDateOfToday() {
    const today = moment();
    return {
      obj: today,
      formatString: today.format(format),
    };
  }

  /**
   * @param { DateObj } dateObj
   * @returns { DateObj }
   */
  static getDateOfSameHourNextDay(dateObj, day) {
    const nextDay = dateObj.obj.clone().add(day, 'd').startOf('hour');
    return {
      obj: nextDay,
      formatString: nextDay.format(format),
    };
  }

  /**
   * @param { DateObj } dateObj
   */
  static getElementsOfDateObj(dateObj) {
    return {
      year: dateObj.obj.year(),
      month: dateObj.obj.month() + 1,
      date: dateObj.obj.date(),
      hour: dateObj.obj.hour(),
    };
  }

  /**
   * @param { String } formatString
   * @returns { undefined | DateObj }
   */
  static getDateOfParam(formatString) {
    const obj = moment(formatString, format);
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

  static isValidLaunchEpochTime(launchEpochTime, startMoment, endMoment) {
    return (
      moment(launchEpochTime).isSameOrAfter(moment(startMoment)) &&
      moment(launchEpochTime).isSameOrBefore(moment(endMoment))
    );
  }

  static getDiffSeconds(launchEpochTime, startMoment) {
    return moment(launchEpochTime).diff(moment(startMoment), 'seconds');
  }
}

module.exports = DateHandler;
