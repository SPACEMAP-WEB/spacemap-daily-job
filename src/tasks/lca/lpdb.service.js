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
    const createdAtObj = DateHandler.getDateOfToday();
    const lpdbRawModelArray = await PpdbHandler.getPpdbModelArray(
      createdAtObj,
      lpdbFilePlainTexts
    );

    const lpdbModelArray = await Promise.all(
      lpdbRawModelArray.map(async (lpdb) => {
        lpdb.placeId = placeId;
        lpdb.pName = 'Launch Vehicle';
        return lpdb;
      })
    );
    await LpdbModel.insertMany(lpdbModelArray);
  }
}
module.exports = LpdbService;
