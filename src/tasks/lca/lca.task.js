/* eslint-disable no-console */

const osu = require('node-os-utils');
const { Mutex } = require('async-mutex');
// eslint-disable-next-line no-unused-vars
const { SendEmailHandler, S3Handler } = require('../../library');
const LcaHandler = require('./lca.handler');
const LpdbService = require('./lpdb.service');
const LcaService = require('./lca.service');

class LcaTask {
  /**
   * @param {S3Handler} s3handler
   */
  constructor(s3handler) {
    this.name = 'LCA TASK';
    this.frequency = '*/30 * * * * *';
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
          console.log(`cpu usage: ${cpuUsagePercent}%`);
          return;
        }

        // 1. Pop task object from Database.
        const task = await this.LcaService.popTaskFromDb();
        if (!task) {
          return;
        }

        taskId = task.taskId;
        const {
          trajectoryFileName,
          remoteInputFilePath,
          remoteOutputFilePath,
          threshold,
          lpdbFileName,
        } = task;
        console.log(`Start task ${taskId}.`);

        // 2. Get trajectory file from S3 to remote Input Path (not remote for me).
        await this.s3handler.downloadTrajectoryFile(
          remoteInputFilePath,
          trajectoryFileName
        );

        // 3. Make LPDB From downloaded trajectory.
        await LcaHandler.createLpdbFile(
          remoteInputFilePath,
          remoteOutputFilePath,
          threshold
        );

        // 4. Upload LPDB File On S3.
        await this.s3handler.uploadLpdbFile(remoteOutputFilePath, lpdbFileName);

        // 5. Save LPDB File On Database.
        await LpdbService.saveLpdbOnDatabase(remoteOutputFilePath, taskId);

        // 6. Update Task object status to success.
        await LcaService.updateTaskStatusSuceess(taskId, lpdbFileName);
        console.log(`Task ${task.taskId} has successfully done.`);
      } catch (err) {
        console.log(err);
        if (MODE !== 'TEST') {
          // 7. If error occured, Update Task object status to fail.
          await this.launchConjunctionsService.updateTaskStatusFailed(
            taskId,
            err
          );
          await SendEmailHandler.sendMail(
            '[SPACEMAP] ppdb task 에서 에러가 발생하였습니다.',
            err
          );
        }
      } finally {
        console.log('task scheduler finish.');
      }
    });
  }
}

module.exports = LcaTask;
