/* eslint-disable no-console */

const osu = require('node-os-utils');
const { Mutex } = require('async-mutex');
const frequencies = require('../tasks-schedules');
const { SendEmailHandler } = require('../../library');
const WatcherCatcherRepository = require('./watcherCatcher.repository');
const WcdbRepository = require('./wcdb.repository');
const WatcherCatcherHandler = require('./watcherCatcher.handler');

class WatcherCatcherTask {
  /**
   * @param {S3Handler} s3handler
   */
  constructor(s3handler) {
    this.name = 'WC TASK';
    this.frequency = frequencies.watcherCatcherFrequency;
    this.mutex = new Mutex();
    this.handler = this.#watcherCatcherScheduleHandler.bind(this);
    this.s3handler = s3handler;
  }

  async #watcherCatcherScheduleHandler(MODE) {
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
        const task = await WatcherCatcherRepository.popTaskFromDb();
        if (!task) {
          return;
        }
        taskId = task.taskId;
        const { remoteInputFilePath, remoteOutputFilePath, s3OutputFileKey } =
          task;
        console.log(`Start WC Task: ${taskId}`);

        // 2. Write parameters file into working directory.
        const parameters =
          await WatcherCatcherRepository.getParametersFromWatcherCatcherByTaskId(
            taskId,
          );
        await WatcherCatcherHandler.writeParameters(
          parameters,
          remoteInputFilePath,
          remoteOutputFilePath,
        );

        // 3. Make WCDB from parameters file
        await WatcherCatcherHandler.createdWcdbFile(remoteInputFilePath);

        // 4. Upload WCDB File On S3.
        await this.s3handler.uploadFile(remoteOutputFilePath, s3OutputFileKey);

        // 5. Update WCDB
        await WcdbRepository.saveWcdbOnDatabase(remoteOutputFilePath, taskId);
        await WatcherCatcherRepository.updateTaskStatusSuceess(
          taskId,
          s3OutputFileKey,
        );
        console.log(`Task ${taskId} has Successfully Done.`);
      } catch (err) {
        console.log(`Task ${taskId} has not done : ${err}`);
        await WatcherCatcherRepository.updateTaskStatusFailed(taskId, err);
        if (MODE !== 'TEST') {
          await SendEmailHandler.sendMail(
            '[SPACEMAP] wc task 에서 에러가 발생하였습니다.',
            err,
          );
        }
      }
    });
  }
}

module.exports = WatcherCatcherTask;
