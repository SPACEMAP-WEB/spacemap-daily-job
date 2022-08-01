/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
const PpdbHandler = require('../ppdb/ppdb.handler');
const { asyncReadFile, DateHandler } = require('../../library');
const ColadbModel = require('./coladb.model');

class ColadbService {
  static async saveColadbOnDatabase(
    coladbPath,
    placeId,
    originalPid,
    originalSid,
  ) {
    const coladbFilePlainTexts = await asyncReadFile(coladbPath, {
      encoding: 'utf-8',
    });
    const createdAtObj = DateHandler.getDateOfToday();
    const coladbRawModelArray = await PpdbHandler.getPpdbModelArray(
      createdAtObj,
      coladbFilePlainTexts,
    );

    const coladbModelArray = await Promise.all(
      coladbRawModelArray
        .filter(
          /* eslint-disable-next-line eqeqeq */
          (coladb) => coladb.sid != originalPid && coladb.sid != originalSid,
        )
        .map(async (coladb) => {
          coladb.placeId = placeId;
          coladb.pName =
            coladb.pid < 0 ? `candidate${-coladb.pid}` : `original`;
          return coladb;
        }),
    );

    await ColadbModel.insertMany(coladbModelArray);
  }
}
module.exports = ColadbService;
