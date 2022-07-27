/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
const PpdbHandler = require('../ppdb/ppdb.handler');
const { asyncReadFile, DateHandler } = require('../../library');
const WcdbModel = require('./wcdb.model');

class WcdbService {
  static async saveWcdbOnDatabase(wcdbPath, placeId) {
    const wcdbFilePlainTexts = await asyncReadFile(wcdbPath, {
      encoding: 'utf-8',
    });
    const createdAtObj = DateHandler.getDateOfToday();
    const lpdbRawModelArray = await PpdbHandler.getPpdbModelArray(
      createdAtObj,
      wcdbFilePlainTexts,
    );

    const wcdbModelArray = await Promise.all(
      lpdbRawModelArray.map(async (wcdb) => {
        wcdb.placeId = placeId;
        wcdb.pName = 'Site';
        return wcdb;
      }),
    );

    await WcdbModel.insertMany(wcdbModelArray);
  }
}
module.exports = WcdbService;
