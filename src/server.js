const App = require('./app');
const { CronScheduler, S3Handler } = require('./library');
const DataBase = require('./library/database');

const TleTask = require('./tasks/tles/tles.task');
const RsosTask = require('./tasks/rsos/rsos.task');
const EventSeqTask = require('./tasks/event-seq/eventSeq.task');
const PpdbTask = require('./tasks/ppdb/ppdb.task');
const LcaTask = require('./tasks/lca/lca.task');

const instanceName = process.env.name || 'UNKNOWN';

const main = async () => {
  await DataBase.initializeDatabase();
  const s3Handler = new S3Handler();

  const app = new App([]);

  const tleTask = new TleTask(s3Handler);
  const rsosTask = new RsosTask();
  const eventSeqTask = new EventSeqTask();
  const ppdbTask = new PpdbTask();
  const lcaTask = new LcaTask(s3Handler);

  if (instanceName === 'spacemap-daily-tasks') {
    const scheduler = new CronScheduler([
      tleTask,
      rsosTask,
      eventSeqTask,
      ppdbTask,
    ]);
    scheduler.startAllSchedules();
  } else if (instanceName === 'spacemap-services-tasks') {
    const scheduler = new CronScheduler([lcaTask]);
    scheduler.startAllSchedules();
  }

  app.listen();
};

main();
