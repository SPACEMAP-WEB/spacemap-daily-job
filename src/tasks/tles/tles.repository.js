/* eslint-disable no-console */
const TleModel = require('./tles.model');

/**
 * @typedef DateObj
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

class TleRepository {
  /**
   * @param {[Object]} tlePlainTexts
   */
  static async saveTleModelsOnDB(uniqueTleModels) {
    const res = await TleModel.insertMany(uniqueTleModels);
    if (!res || res.length !== uniqueTleModels.length) {
      throw new Error('Insert Tle Error.');
    }
  }

  static async deleteAllTle() {
    const res = await TleModel.deleteMany({});
    const { acknowledged } = res;
    if (!acknowledged) {
      throw new Error('Delete Tle Error.');
    }
  }

  static async saveTleFileOnS3(tlePlainTexts) {
    console.log(tlePlainTexts);
  }
}

module.exports = TleRepository;
