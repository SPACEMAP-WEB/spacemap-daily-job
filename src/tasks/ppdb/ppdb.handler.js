const { StringHandler, asyncReadFile, DateHandler } = require('../../library');
const TleHandler = require('../tles/tles.handler');

/**
 * @typedef DateObj
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

const FROM_PPDB_PATH = '/data/COOP/workingFolder/PPDB2.txt';

class PpdbHandler {
  static async readPpdbFile() {
    const ppdbPlainTexts = await asyncReadFile(FROM_PPDB_PATH, {
      encoding: 'utf-8',
    });
    if (!StringHandler.isValidString(ppdbPlainTexts)) {
      throw new Error('Invalid ppdb file. (at PpdbHandler.readPPdbFile())');
    }
    return ppdbPlainTexts;
  }

  static async #getPpdbModel(createdAt, rawPpdb) {
    const splitPpdb = rawPpdb.split('\t');
    const [
      pid,
      sid,
      dca,
      tca,
      tcaStart,
      tcaEnd,
      year,
      month,
      date,
      hours,
      min,
      sec,
      probability,
    ] = splitPpdb;
    const pName = await TleHandler.getNameByUsingId(Number(pid));
    const sName = await TleHandler.getNameByUsingId(Number(sid));
    const { standardTime, tcaTime, tcaStartTime, tcaEndTime } =
      DateHandler.getPpdbTime(
        year,
        month,
        date,
        hours,
        min,
        sec,
        tca,
        tcaStart,
        tcaEnd,
      );
    return {
      createdAt,
      pid,
      pName,
      sid,
      sName,
      dca,
      tcaTime,
      tcaStartTime,
      tcaEndTime,
      standardTime,
      probability,
    };
  }

  /**
   * @param {DateObj} dateObj
   * @param {String} ppdbPlainTexts
   */
  static async getPpdbModelArray(dateObj, ppdbPlainTexts) {
    const createdAt = DateHandler.getDateOfParam(
      dateObj.formatString,
    ).obj.toDate();
    const ppdbTextsArray = ppdbPlainTexts.split('\n');
    await TleHandler.getNameByUsingId(11);
    const ppdbModelArray = await Promise.all(
      ppdbTextsArray
        .filter(StringHandler.isNotCommentLine)
        .map(async (ppdbText) => {
          return this.#getPpdbModel(createdAt, ppdbText);
        }),
    );
    return ppdbModelArray;
  }
}

module.exports = PpdbHandler;
