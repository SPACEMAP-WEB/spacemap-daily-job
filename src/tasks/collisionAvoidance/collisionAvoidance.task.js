/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars

const osu = require('node-os-utils');
const { Mutex } = require('async-mutex');
const frequencies = require('../tasks-schedules');
const CollisionAvoidanceRepository = require('./collisionAvoidance.repository');
const ColadbRepository = require('./coladb.repository');
const CollisionAvoidanceHandler = require('./collisionAvoidance.handler');

class CollisionAvoidanceTask {
  constructor() {
    this.name = 'COLA TASK';
    this.frequency = frequencies.collisionAvoidanceFrequency;
    this.mutex = new Mutex();
    this.handler = this.#collisionAvoidanceScheduleHandler.bind(this);
  }

  async #collisionAvoidanceScheduleHandler() {
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
        const { remoteInputFileListPath, remoteOutputFilePath } = task;
        console.log(`end 1: ${taskId}`);

        // 2. Write parameters file into working directory.
        const parameters =
          await CollisionAvoidanceRepository.getParametersFromCollisionAvoidanceByTaskId(
            taskId,
          );

        // 3. Make candidated paths
        await CollisionAvoidanceHandler.writeOriginalPath();
        // a) get tle of primary RSO from platform-api (output: tle of primary RSO)
        // b) make original path of primary RSO
        //  (input:  tle, prameters)
        //  (output: trajectory of original primary RSO & write in local)
        // c) make candidates path
        //  (input:  original path)
        //  (output: offset trajectories)

        // 4. Make COLADB from parameters file
        await CollisionAvoidanceHandler.createdColadbFile(
          remoteInputFileListPath,
          remoteOutputFilePath,
          parameters.threshold,
        );
        // Complete

        // 5. Update COLADB
        await ColadbRepository.saveColadbOnDatabase(
          remoteOutputFilePath,
          taskId,
        );
        await CollisionAvoidanceRepository.updateTaskStatusSuceess(
          taskId,
          remoteOutputFilePath,
        );
        console.log(`Task ${taskId} has Successfully Done.`);
      } catch (err) {
        console.log(`Task ${taskId} has not done : ${err}`);
        await CollisionAvoidanceRepository.updateTaskStatusFailed(taskId, err);
      }
    });
  }
}

module.exports = CollisionAvoidanceTask;
