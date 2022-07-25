/* eslint-disable no-console */
const RsosModel = require('./rsos.model');
const { BadRequestException } = require('../../common/exceptions');

/**
 * @typedef DateObj
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

class RsosRepository {
  static async updateRsoParams(rsoParams) {
    const options = { upsert: true, setDefaultsOnInsert: true };
    const updateResult = rsoParams.map(async (rsoParam) => {
      const { id, objtype, objectname, rcssize, country } = rsoParam;
      if (!id) {
        return;
      }
      await RsosModel.findOneAndUpdate(
        { id },
        { id, objtype, objectname, rcssize, country },
        options
      );
    });
    await Promise.all(updateResult);
  }

  static async getRsoParams(id = undefined) {
    const rsoParams = await (id
      ? RsosModel.findOne({ id }).exec()
      : RsosModel.find().exec());
    if (!rsoParams || (!id && rsoParams.length === 0)) {
      throw new BadRequestException('No rso.');
    }
    return rsoParams;
  }
}

module.exports = RsosRepository;
