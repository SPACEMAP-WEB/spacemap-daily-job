const cron = require('node-cron');
const DateHandler = require('./date-handler');

class CronScheduler {
  /**
   * @param {[Object]} taskObjs
   */
  constructor(taskArray) {
    this.taskSchedulers = taskArray.map((task) => {
      const { frequency, handler } = task;
      const dateOfToday = DateHandler.getDateOfToday();
      return cron.schedule(
        frequency,
        async () => {
          await handler(dateOfToday);
        },
        {
          scheduled: false,
        }
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
