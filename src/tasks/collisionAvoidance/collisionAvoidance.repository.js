/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
const { default: mongoose } = require('mongoose');
const {
  CollisionAvoidanceModel,
  ColaTaskModel,
} = require('./collisionAvoidance.model');
const { BadRequestException } = require('../../common/exceptions');

class CollisionAvoidanceRepository {
  static async getParametersFromCollisionAvoidanceByTaskId(taskId) {
    const taskResult = await CollisionAvoidanceModel.findById(taskId);
    if (!taskResult) {
      throw new BadRequestException('No such task.');
    }
    console.log(taskResult);
    const {
      pidOfConjunction,
      sidOfConjunction,
      firstLineOfPrimary,
      secondLineOfPrimary,
      startMomentOfCola,
      endMomentOfCola,
      avoidanceLength,
      amountOfLevel,
      numberOfPaths,
      candidatedPaths,
      predictionEpochTime,
      colaEpochTime,
      threshold,
    } = taskResult;
    const parameters = {
      pidOfConjunction,
      sidOfConjunction,
      firstLineOfPrimary,
      secondLineOfPrimary,
      startMomentOfCola,
      endMomentOfCola,
      avoidanceLength,
      amountOfLevel,
      numberOfPaths,
      candidatedPaths,
      predictionEpochTime,
      colaEpochTime,
      threshold,
    };
    return parameters;
  }

  static async popTaskFromDb() {
    const task = await ColaTaskModel.findOneAndDelete({})
      .sort({ createdAt: 1 })
      .exec();
    return task;
  }

  static async updateCandidatedPaths(taskId, s3urls) {
    return CollisionAvoidanceModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(taskId) },
      { candidatedPaths: s3urls.map((s3url) => s3url.Location) },
    );
  }

  static async updateTaskStatusSuceess(taskId, coladbFilePath) {
    return CollisionAvoidanceModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(taskId) },
      { status: 'DONE', coladbFilePath },
    );
  }

  static async updateTaskStatusFailed(taskId, errorMessage) {
    if (taskId !== 0) {
      return CollisionAvoidanceModel.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(taskId) },
        { status: 'ERROR', errorMessage },
      );
    }
    return undefined;
  }
}

module.exports = CollisionAvoidanceRepository;
