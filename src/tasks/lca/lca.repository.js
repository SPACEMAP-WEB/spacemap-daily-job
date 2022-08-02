/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

const { default: mongoose } = require('mongoose');
const { LaunchConjunctionsModel, LaunchTaskModel } = require('./lca.model');

class LcaRepository {
  static async popTaskFromDb() {
    const task = await LaunchTaskModel.findOneAndDelete({})
      .sort({ createdAt: 1 })
      .exec();
    return task;
  }

  static async updateTaskStatusSuceess(taskId, lpdbFilePath) {
    return LaunchConjunctionsModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(taskId) },
      { status: 'DONE', lpdbFilePath },
    );
  }

  static async updateTaskStatusFailed(taskId, errorMessage) {
    if (taskId !== 0) {
      return LaunchConjunctionsModel.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(taskId) },
        { status: 'ERROR', errorMessage },
      );
    }
    return undefined;
  }
}

module.exports = LcaRepository;
