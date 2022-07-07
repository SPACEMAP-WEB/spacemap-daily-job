const App = require('./app');
const { CronScheduler } = require('./library');
const DataBase = require('./library/database');
const PpdbTask = require('./tasks/ppdb/ppdb.task');
const TleTask = require('./tasks/tles/tles.task');

const main = async () => {
  await DataBase.initializeDatabase();
  const app = new App([]);

  const tleTask = new TleTask();
  const ppdbTask = new PpdbTask();
  const scheduler = new CronScheduler([tleTask, ppdbTask]);

  app.listen();
  scheduler.startAllSchedules();
};

main();
