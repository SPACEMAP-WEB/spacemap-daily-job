/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// const WatcherCatcherModel = require('./watcherCatcher.model');
const { default: mongoose } = require('mongoose');
const Cesium = require('cesium');
const moment = require('moment');
const {
  WatcherCatcherModel,
  WatcherCatcherTaskModel,
} = require('./watcherCatcher.model');
const WcdbModel = require('./wcdb.model');
const WcdbRepository = require('./wcdb.repository');
const {
  BadRequestException,
  HttpException,
} = require('../../common/exceptions');

class WatcherCatcherRepository {
  static async readWatcherCatcher(email) {
    const result = await WatcherCatcherModel.find({ email });
    return result;
  }

  static async findWatcherCatcher(placeId) {
    const taskResult = await WatcherCatcherModel.findById(placeId);
    if (!taskResult) {
      throw new BadRequestException('No such task.');
    }
    const { status } = taskResult;
    if (status !== 'DONE') {
      throw new BadRequestException('Job has not finished.');
    }
    const wcdbResult = await WcdbModel.find({ placeId });
    const watcherCatcherResult = {
      latitude: taskResult.latitude,
      longitude: taskResult.longitude,
      epochTime: taskResult.epochTime,
      predictionEpochTime: taskResult.predictionEpochTime,
      wcdb: wcdbResult,
    };
    return watcherCatcherResult;
  }

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

  static async deleteWatcherCatcher(placeId) {
    await WatcherCatcherModel.deleteMany({
      _id: mongoose.Types.ObjectId(placeId),
    });
    return WcdbModel.deleteMany({ placeId }).exec();
  }

  static async enqueTaskOnDb(
    taskId,
    remoteInputFilePath,
    remoteOutputFilePath,
    threshold,
    localOutputPath
  ) {
    const task = {
      taskId,
      remoteInputFilePath,
      remoteOutputFilePath,
      threshold,
      localOutputPath,
    };
    console.log(await WatcherCatcherTaskModel.create(task));
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
      { status: 'DONE', wcdbFilePath }
    );
  }

  static async updateTaskStatusFailed(taskId, errorMessage) {
    const result = await WatcherCatcherModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(taskId) },
      { status: 'ERROR', errorMessage }
    );
  }
}
module.exports = WatcherCatcherRepository;
