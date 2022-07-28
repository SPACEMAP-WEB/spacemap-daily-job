/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// const CollisionAvoidanceModel = require('./collisionAvoidance.model');
const { default: mongoose } = require('mongoose');
const Cesium = require('cesium');
const moment = require('moment');
const {
  CollisionAvoidanceModel,
  CollisionAvoidanceTaskModel,
} = require('./collisionAvoidance.model');
const ColadbModel = require('./coladb.model');
const ColadbRepository = require('./coladb.repository');
const {
  BadRequestException,
  HttpException,
} = require('../../common/exceptions');

class CollisionAvoidanceRepository {
  static async readCollisionAvoidance(email) {
    const result = await CollisionAvoidanceModel.find({ email });
    return result;
  }

  static async findCollisionAvoidance(placeId) {
    const taskResult = await CollisionAvoidanceModel.findById(placeId);
    if (!taskResult) {
      throw new BadRequestException('No such task.');
    }
    const { status } = taskResult;
    if (status !== 'DONE') {
      throw new BadRequestException('Job has not finished.');
    }
    const coladbResult = await ColadbModel.find({ placeId });
    const collisionAvoidanceResult = {
      latitude: taskResult.latitude,
      longitude: taskResult.longitude,
      epochTime: taskResult.epochTime,
      predictionEpochTime: taskResult.predictionEpochTime,
      coladb: coladbResult,
    };
    return collisionAvoidanceResult;
  }

  static async getParametersFromCollisionAvoidanceByTaskId(taskId) {
    const taskResult = await CollisionAvoidanceModel.findById(taskId);
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

  static async deleteCollisionAvoidance(placeId) {
    await CollisionAvoidanceModel.deleteMany({
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
    console.log(await CollisionAvoidanceTaskModel.create(task));
  }

  static async popTaskFromDb() {
    const task = await CollisionAvoidanceTaskModel.findOneAndDelete({})
      .sort({ createdAt: 1 })
      .exec();
    return task;
  }

  static async updateTaskStatusSuceess(taskId, coladbFilePath) {
    return CollisionAvoidanceModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(taskId) },
      { status: 'DONE', coladbFilePath },
    );
  }

  static async updateTaskStatusFailed(taskId, errorMessage) {
    const result = await CollisionAvoidanceModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(taskId) },
      { status: 'ERROR', errorMessage },
    );
  }
}
module.exports = CollisionAvoidanceRepository;
