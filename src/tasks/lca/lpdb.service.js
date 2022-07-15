/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
const LpdbModel = require('./lpdb.model');
const TleHandler = require('../tles/tles.handler');
const { asyncReadFile, DateHandler } = require('../../library');
const PpdbHandler = require('../ppdb/ppdb.handler');

class LpdbService {
  static async saveLpdbOnDatabase(localLpdbFilePath, placeId) {
    const lpdbFilePlainTexts = await asyncReadFile(localLpdbFilePath, {
      encoding: 'utf-8',
    });
    const createdAt = DateHandler.getDateOfToday();
    const lpdbModelArray = await PpdbHandler.getPpdbModelArray(
      createdAt,
      lpdbFilePlainTexts
    );

    lpdbModelArray.forEach((lpdb) => {
      const { sid } = lpdb;
      lpdb.createdAt = createdAt;
      lpdb.placeId = placeId;
      lpdb.pName = 'Launch Vehicle';
      lpdb.sName = TleHandler.getNameByUsingId(sid);
    });
    await LpdbModel.insertMany(lpdbModelArray);
  }
}
module.exports = LpdbService;
