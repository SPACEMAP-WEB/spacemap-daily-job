const App = require('./app');
const { CronScheduler } = require('./library');
const TleTask = require('./tasks/tles/tles.task');

const main = async () => {
  const app = new App([]);
  const tleTask = new TleTask();
  const scheduler = new CronScheduler([tleTask]);

  app.listen();
  scheduler.startAllSchedules();
};

main();
