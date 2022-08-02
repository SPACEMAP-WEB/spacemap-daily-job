/* eslint-disable no-console */

const osu = require('node-os-utils');
const { Mutex } = require('async-mutex');
const frequencies = require('../tasks-schedules');
const { SendEmailHandler } = require('../../library');
const CollisionAvoidanceRepository = require('./collisionAvoidance.repository');
const ColadbRepository = require('./coladb.repository');
const CollisionAvoidanceHandler = require('./collisionAvoidance.handler');

class CollisionAvoidanceTask {
  /**
   * @param {S3Handler} s3handler
   */
  constructor(s3handler) {
    this.name = 'COLA TASK';
    this.frequency = frequencies.collisionAvoidanceFrequency;
    this.mutex = new Mutex();
    this.handler = this.#collisionAvoidanceScheduleHandler.bind(this);
    this.s3handler = s3handler;
  }

  async #collisionAvoidanceScheduleHandler(MODE) {
    let taskId = 0;
    await this.mutex.runExclusive(async () => {
      try {
        /*
         * 0. check the cpu average usage
         *   => can only be calculated when the average cpu usage is less than 10%.
         */
        const { cpu } = osu;
        const cpuUsagePercent = await cpu.usage();
        if (cpuUsagePercent > 10) {
          // console.log(`cpu usage: ${cpuUsagePercent}%`);
          return;
        }

        // 1. Pop task object from Database.
        const task = await CollisionAvoidanceRepository.popTaskFromDb();
        if (!task) {
          return;
        }
        taskId = task.taskId;
        const {
          remoteInputFilePath,
          remoteInputFileListPath,
          remoteInputFilePrefix,
          remoteOutputFilePath,
          s3InputFileKey,
          s3OutputFileKey,
        } = task;
        console.log(`Start COLA Task: ${taskId}`);

        // 2. Write parameters file into working directory.
        const parameters =
          await CollisionAvoidanceRepository.getParametersFromCollisionAvoidanceByTaskId(
            taskId,
          );

        // 3. Make candidated paths
        await CollisionAvoidanceHandler.writePaths(
          parameters,
          remoteInputFilePrefix,
        );

        // 4. Make COLADB from parameters file
        await CollisionAvoidanceHandler.createdColadbFile(
          remoteInputFileListPath,
          remoteOutputFilePath,
          parameters.threshold,
        );

        // 5-1. Upload trajectory files on s3.
        const s3urls = await this.s3handler.uploadFiles(
          remoteInputFilePath,
          s3InputFileKey,
        );
        CollisionAvoidanceRepository.updateCandidatedPaths(taskId, s3urls);
        // 5-2. Upload COLADB file on s3.
        await this.s3handler.uploadFile(remoteOutputFilePath, s3OutputFileKey);

        // 6. Update COLADB
        await ColadbRepository.saveColadbOnDatabase(
          remoteOutputFilePath,
          taskId,
          parameters.pidOfConjunction,
          parameters.sidOfConjunction,
        );
        await CollisionAvoidanceRepository.updateTaskStatusSuceess(
          taskId,
          s3OutputFileKey,
        );
        console.log(`Task ${taskId} has Successfully Done.`);
      } catch (err) {
        console.log(`Task ${taskId} has not done : ${err}`);
        await CollisionAvoidanceRepository.updateTaskStatusFailed(taskId, err);
        if (MODE !== 'TEST') {
          await SendEmailHandler.sendMail(
            '[SPACEMAP] cola task 에서 에러가 발생하였습니다.',
            err,
          );
        }
      }
    });
  }
}

module.exports = CollisionAvoidanceTask;
