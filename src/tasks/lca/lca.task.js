/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars

const osu = require('node-os-utils');
const { Mutex } = require('async-mutex');
const frequencies = require('../tasks-schedules');
const { SendEmailHandler } = require('../../library');
const LcaHandler = require('./lca.handler');
const LpdbRepository = require('./lpdb.repository');
const LcaRepository = require('./lca.repository');

class LcaTask {
  /**
   * @param {S3Handler} s3handler
   */
  constructor(s3handler) {
    this.name = 'LCA TASK';
    this.frequency = frequencies.lcaFrequency;
    this.mutex = new Mutex();
    this.handler = this.#lcaScheduleHandler.bind(this);
    this.s3handler = s3handler;
  }

  async #lcaScheduleHandler(dateObj, MODE) {
    await this.mutex.runExclusive(async () => {
      let taskId = 0;
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
        const task = await LcaRepository.popTaskFromDb();
        if (!task) {
          return;
        }

        taskId = task.taskId;
        const {
          s3InputFileKey,
          remoteInputFilePath,
          remoteOutputFilePath,
          threshold,
          s3OutputFileKey,
        } = task;
        console.log(`Start task ${taskId}.`);

        // 2. Get trajectory file from S3 to remote Input Path (not remote for me).
        await this.s3handler.downloadTrajectoryFile(
          remoteInputFilePath,
          s3InputFileKey,
        );

        // 3. Make LPDB From downloaded trajectory.
        await LcaHandler.createLpdbFile(
          remoteInputFilePath,
          remoteOutputFilePath,
          threshold,
        );

        // 4. Upload LPDB File On S3.
        await this.s3handler.uploadLpdbFile(
          remoteOutputFilePath,
          s3OutputFileKey,
        );

        // 5. Save LPDB File On Database.
        await LpdbRepository.saveLpdbOnDatabase(remoteOutputFilePath, taskId);

        // 6. Update Task object status to success.
        await LcaRepository.updateTaskStatusSuceess(taskId, s3OutputFileKey);
        console.log(`Task ${task.taskId} has successfully done.`);
      } catch (err) {
        console.log(err);
        // 7. If error occured, Update Task object status to fail.
        await LcaRepository.updateTaskStatusFailed(taskId, err);
        if (MODE !== 'TEST') {
          await SendEmailHandler.sendMail(
            '[SPACEMAP] lpdb task 에서 에러가 발생하였습니다.',
            err,
          );
        }
      }
    });
  }
}

module.exports = LcaTask;
