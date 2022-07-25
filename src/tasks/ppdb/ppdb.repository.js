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

  static async #splitArrayIntoEqualChunks(arr, chunkSize) {
    let firstIdx = 0;
    const chunkedArr = [];
    for (let i = 0; i < arr.length; i += 1) {
      if ((i + 1) % chunkSize === 0) {
        const innerArr = [];
        for (let j = firstIdx; j <= i; j += 1) {
          innerArr.push(arr[j]);
          firstIdx = i + 1;
        }
        chunkedArr.push(innerArr);
      }
    }
    return chunkedArr;
  }

  // static async savePpdbModelsOnDB(ppdbModelArray) {
  //   try {
  //     await this.#deleteAllPpdb();

  //     const chunkedPpdbModelArray = await this.#splitArrayIntoEqualChunks(
  //       ppdbModelArray,
  //       10
  //     );
  //     const resultArray = await Promise.all(
  //       chunkedPpdbModelArray.map(async (ppdbArray) => {
  //         console.log(ppdbArray);
  //         const res = await PpdbModel.insertMany(ppdbArray);
  //         return res ? res.length : 0;
  //       })
  //     );
  //     const insertedCount = resultArray.reduce((sum, e) => sum + e, 0);
  //     console.log(insertedCount);
  //     console.log(ppdbModelArray.length);
  //     if (insertedCount !== ppdbModelArray.length) {
  //       await this.#deleteAllPpdb();
  //       throw new Error('Save ppdb failed.');
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  static async savePpdbModelsOnDB(ppdbModelArray) {
    try {
      await this.#deleteAllPpdb();
      await PpdbModel.insertMany(ppdbModelArray);
      return PpdbModel.createIndexes({ tcaTime: 1, probability: 1, dca: 1 });
    } catch (err) {
      console.log(err);
      await this.#deleteAllPpdb();
      throw new Error('Save ppdb failed.');
    }
  }
}

module.exports = PpdbRepository;
