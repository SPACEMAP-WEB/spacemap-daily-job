/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// const CollisionAvoidancesModel = require('./collisionAvoidances.model');
const { default: mongoose } = require('mongoose');
const Cesium = require('cesium');
const moment = require('moment');
const {
  CollisionAvoidancesModel,
  CollisionAvoidancesTaskModel,
} = require('./collisionAvoidances.model');
const ColadbModel = require('./coladb.model');
const ColadbRepository = require('./coladb.repository');
const {
  BadRequestException,
  HttpException,
} = require('../../common/exceptions');

class CollisionAvoidancesRepository {
  static async readCollisionAvoidances(email) {
    const result = await CollisionAvoidancesModel.find({ email });
    return result;
  }

  static async findCollisionAvoidances(placeId) {
    const taskResult = await CollisionAvoidancesModel.findById(placeId);
    if (!taskResult) {
      throw new BadRequestException('No such task.');
    }
    const { status } = taskResult;
    if (status !== 'DONE') {
      throw new BadRequestException('Job has not finished.');
    }
    const coladbResult = await ColadbModel.find({ placeId });
    const collisionAvoidancesResult = {
      latitude: taskResult.latitude,
      longitude: taskResult.longitude,
      epochTime: taskResult.epochTime,
      predictionEpochTime: taskResult.predictionEpochTime,
      coladb: coladbResult,
    };
    return collisionAvoidancesResult;
  }

  static async getParametersFromCollisionAvoidancesByTaskId(taskId) {
    const taskResult = await CollisionAvoidancesModel.findById(taskId);
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

  static async deleteCollisionAvoidances(placeId) {
    await CollisionAvoidancesModel.deleteMany({
      _id: mongoose.Types.ObjectId(placeId),
    });
    return ColadbModel.deleteMany({ placeId }).exec();
  }

  static async enqueTaskOnDb(
    taskId,
    remoteInputFilePath,
    remoteOutputFilePath,
    threshold,
    localOutputPath,
  ) {
    const task = {
      taskId,
      remoteInputFilePath,
      remoteOutputFilePath,
      threshold,
      localOutputPath,
    };
    console.log(await CollisionAvoidancesTaskModel.create(task));
  }

  static async popTaskFromDb() {
    const task = await CollisionAvoidancesTaskModel.findOneAndDelete({})
      .sort({ createdAt: 1 })
      .exec();
    return task;
  }

  static async updateTaskStatusSuceess(taskId, coladbFilePath) {
    return CollisionAvoidancesModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(taskId) },
      { status: 'DONE', coladbFilePath },
    );
  }

  static async updateTaskStatusFailed(taskId, errorMessage) {
    const result = await CollisionAvoidancesModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(taskId) },
      { status: 'ERROR', errorMessage },
    );
  }
}
module.exports = CollisionAvoidancesRepository;
