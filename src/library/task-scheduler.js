const cron = require('node-cron');
const DateHandler = require('./date-handler');

const MODE = process.env.MODE || 'TEST';

class CronScheduler {
  /**
   * @param {[Object]} taskObjs
   */
  constructor(taskArray) {
    console.log(process.env.MODE);
    this.taskSchedulers = taskArray.map((task) => {
      const { frequency, handler } = task;
      return cron.schedule(
        frequency,
        async () => {
          await handler(DateHandler.getDateOfToday(), MODE);
        },
        {
          scheduled: false,
        },
      );
    });
  }

  startAllSchedules() {
    const startTask = (taskObj) => {
      taskObj.start();
    };
    this.taskSchedulers.forEach(startTask);
  }
}

module.exports = CronScheduler;
