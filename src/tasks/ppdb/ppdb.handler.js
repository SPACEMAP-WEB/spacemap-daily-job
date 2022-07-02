const { StringHandler, asyncReadFile, DateHandler } = require('../../library');
const TleHandler = require('../tles/tles.handler');

/**
 * @typedef DateObj
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

class PpdbHandler {
  #FROM_PPDB_PATH = '/data/COOP/workingFolder/PPDB2.txt';

  static async readPpdbFile() {
    const ppdbPlainTexts = asyncReadFile(this.#FROM_PPDB_PATH, {
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
    const pName = TleHandler.getNameByUsingId(Number(pid));
    const sName = TleHandler.getNameByUsingId(Number(sid));
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
        tcaEnd
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
    const createdAt = dateObj.obj.toDate();
    const ppdbTextsArray = ppdbPlainTexts.split('\n');
    const ppdbModelArray = await Promise.all(
      ppdbTextsArray
        .filter(StringHandler.isCommentLine === false)
        .map(async (ppdbText) => {
          return this.#getPpdbModel(createdAt, ppdbText);
        })
    );
    return ppdbModelArray;
  }
}

module.exports = PpdbHandler;
