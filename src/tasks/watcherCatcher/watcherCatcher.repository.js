/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// const WatcherCatcherModel = require('./watcherCatcher.model');
const { default: mongoose } = require('mongoose');
const {
  WatcherCatcherModel,
  WatcherCatcherTaskModel,
} = require('./watcherCatcher.model');
const { BadRequestException } = require('../../common/exceptions');

class WatcherCatcherRepository {
  static async getParametersFromWatcherCatcherByTaskId(taskId) {
    const taskResult = await WatcherCatcherModel.findById(taskId);
    if (!taskResult) {
      throw new BadRequestException('No such task.');
    }
    const {
      latitude,
      longitude,
      localX,
      localY,
      localZ,
      altitude,
      fieldOfView,
      epochTime,
      endTime,
      predictionEpochTime,
      threshold,
    } = taskResult;
    const parameters = {
      latitude,
      longitude,
      localX,
      localY,
      localZ,
      altitude,
      fieldOfView,
      epochTime,
      endTime,
      predictionEpochTime,
      threshold,
    };
    return parameters;
  }

  static async popTaskFromDb() {
    const task = await WatcherCatcherTaskModel.findOneAndDelete({})
      .sort({ createdAt: 1 })
      .exec();
    return task;
  }

  static async updateTaskStatusSuceess(taskId, wcdbFilePath) {
    return WatcherCatcherModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(taskId) },
      { status: 'DONE', wcdbFilePath },
    );
  }

  static async updateTaskStatusFailed(taskId, errorMessage) {
    if (taskId !== 0) {
      return WatcherCatcherModel.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(taskId) },
        { status: 'ERROR', errorMessage },
      );
    }
    return undefined;
  }
}

module.exports = WatcherCatcherRepository;
