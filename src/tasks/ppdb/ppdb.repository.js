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

  static async #splitArrayIntoEqualChunks(arr) {
    let chunkSize = 10;
    if (chunkSize < 2) return [arr];

    const arrayLength = arr.length;
    const chunkedArr = [];
    let i = 0;
    if (arrayLength % chunkSize === 0) {
      const size = Math.floor(arrayLength / chunkSize);
      while (i < arrayLength) {
        chunkedArr.push(arr.slice(i, i + size));
        i += size;
      }
    } else {
      while (i < arrayLength) {
        const size = Math.ceil((arrayLength - i) / chunkSize);
        chunkSize -= 1;
        chunkedArr.push(arr.slice(i, i + size));
        i += size;
      }
    }
    return chunkedArr;
  }

  static async savePpdbModelsOnDB(ppdbModelArray) {
    try {
      await this.#deleteAllPpdb();

      const chunkedPpdbModelArray = await this.#splitArrayIntoEqualChunks(
        ppdbModelArray,
      );
      const resultArray = await Promise.all(
        chunkedPpdbModelArray.map(async (ppdbArray) => {
          const res = await PpdbModel.insertMany(ppdbArray);
          return res ? res.length : 0;
        }),
      );
      const insertedCount = resultArray.reduce((sum, e) => sum + e, 0);
      if (insertedCount !== ppdbModelArray.length) {
        await this.#deleteAllPpdb();
        throw new Error('Save ppdb failed.');
      }
    } catch (err) {
      console.log(err);
    }
  }

  // static async savePpdbModelsOnDB(ppdbModelArray) {
  //   try {
  //     await this.#deleteAllPpdb();
  //     await PpdbModel.insertMany(ppdbModelArray);
  //     return PpdbModel.createIndexes({ tcaTime: 1, probability: 1, dca: 1 });
  //   } catch (err) {
  //     console.log(err);
  //     await this.#deleteAllPpdb();
  //     throw new Error('Save ppdb failed.');
  //   }
  // }
}

module.exports = PpdbRepository;
