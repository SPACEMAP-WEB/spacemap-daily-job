/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars

const osu = require('node-os-utils');
const { Mutex } = require('async-mutex');
const frequencies = require('../tasks-schedules');
const WatcherCatcherRepository = require('./watcherCatcher.repository');
const WcdbRepository = require('./wcdb.repository');
const WatcherCatcherHandler = require('./watcherCatcher.handler');

class WatcherCatcherTask {
  constructor() {
    this.name = 'WC TASK';
    this.frequency = frequencies.watcherCatcherFrequency;
    this.mutex = new Mutex();
    this.handler = this.#watcherCatcherScheduleHandler.bind(this);
  }

  async #watcherCatcherScheduleHandler() {
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
        const { remoteInputFilePath, remoteOutputFilePath } = task;
        console.log(`end 1: ${taskId}`);

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

        // 4. Update WCDB
        await WcdbRepository.saveWcdbOnDatabase(remoteOutputFilePath, taskId);
        await WatcherCatcherRepository.updateTaskStatusSuceess(
          taskId,
          remoteOutputFilePath,
        );
        console.log(`Task ${taskId} has Successfully Done.`);
      } catch (err) {
        console.log(`Task ${taskId} has not done : ${err}`);
        await WatcherCatcherRepository.updateTaskStatusFailed(taskId, err);
      }
    });
  }
}

module.exports = WatcherCatcherTask;
