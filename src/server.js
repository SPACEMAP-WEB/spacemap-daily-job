const App = require('./app');
const { CronScheduler, S3Handler } = require('./library');
const DataBase = require('./library/database');

const PpdbTask = require('./tasks/ppdb/ppdb.task');
const TleTask = require('./tasks/tles/tles.task');
const EventSeqTask = require('./tasks/event-seq/eventSeq.task');

const main = async () => {
  await DataBase.initializeDatabase();
  const s3Handler = new S3Handler();

  const app = new App([]);

  const tleTask = new TleTask(s3Handler);
  const ppdbTask = new PpdbTask();
  const eventSeqTask = new EventSeqTask();
  const scheduler = new CronScheduler([tleTask, eventSeqTask, ppdbTask]);

  app.listen();
  scheduler.startAllSchedules();
};

main();
