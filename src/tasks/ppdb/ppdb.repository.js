/* eslint-disable no-console */
const PpdbModel = require('./ppdb.model');

class PpdbRepository {
  static async #deleteAllPpdb() {
    const res = await PpdbModel.deleteMany({}).exec();
    if (!res) {
      throw new Error('Delete Failed!');
    }
    const { acknowledged } = res;
    if (!acknowledged) {
      throw new Error('Delete Failed!');
    }
  }

  static async savePpdbModelsOnDB(ppdbModelArray) {
    this.#deleteAllPpdb();
    const res = await PpdbModel.insertMany(ppdbModelArray);
    if (!res || res.length !== ppdbModelArray.length) {
      throw new Error('Ppdb Insert Error.');
    }
  }

  static async savePpdbFileOnS3(ppdbPlainTexts) {
    console.log(ppdbPlainTexts);
    // const res = await httpRequestHandler.post(`${this.baseUrl}/texts`, {
    //   ppdbPlainTexts,
    // });
    // if (httpRequestHandler.fail(res)) {
    //   throw new Error('ppdb plain texts post failed.');
    // }
  }
}

module.exports = PpdbRepository;
