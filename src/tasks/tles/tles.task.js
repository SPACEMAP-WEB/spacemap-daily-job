/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const TleRepository = require('./tles.repository');
const TleHandler = require('./tles.handler');
const {
  SendEmailHandler,
  httpRequestHandler,
  DateHandler,
  asyncWriteFile,
} = require('../../library');

/**
 * @typedef Date
 * @property { String } formatString
 * @property { moment.Moment } obj
 */

class TleTask {
  #SPACETRACK_URI = 'https://www.space-track.org';

  #AUTH_URI = 'ajaxauth/login';

  #QUERY_URI =
    'basicspacedata/query/class/gp/decay_date/null-val/EPOCH/%3Enow-30/MEAN_MOTION/%3E11.25/ECCENTRICITY/%3C0.25/orderby/NORAD_CAT_ID,EPOCH/format/3le';

  constructor(s3Handler) {
    this.name = 'TLE TASK';
    this.frequency = '0 0 15 * * *';
    // this.frequency = '* * * * * *';
    this.excuting = false;
    this.handler = this.#tleScheduleHandler.bind(this);
    this.s3Handler = s3Handler;
  }

  /**
   * @param { Date } dateObj
   */
  async #tleScheduleHandler(dateObj, MODE) {
    if (this.excuting) {
      return;
    }
    console.log('tle scheduler start.');
    this.excuting = true;

    const localTleFilePath = `./public/tles/${dateObj.formatString}.tle`;
    const s3FileName = `${dateObj.formatString}.tle`;

    try {
      // 0. Check if today is tle clean day.
      if (DateHandler.isTleCleanDay()) {
        await TleRepository.deleteAllTle();
      }

      // 1. login spacetrack => get Accesstoken
      const loginCookie = await httpRequestHandler.getLoginCookie(
        `${this.#SPACETRACK_URI}/${this.#AUTH_URI}`,
        process.env.SPACETRACK
      );

      // 2. get plain texts from spacetrack.
      const tlePlainTexts = await httpRequestHandler.getContentsRequest(
        `${this.#SPACETRACK_URI}/${this.#QUERY_URI}`,
        loginCookie
      );

      // 3. parse tleplaintexts
      const { tles, newTlePlainTexts } = TleHandler.parse(
        dateObj,
        tlePlainTexts
      );

      // 4. update ID-NAME pairs
      await TleHandler.setIdNamePair(tles);

      // 5. save TleFile on local file
      await asyncWriteFile(localTleFilePath, newTlePlainTexts);

      if (MODE === 'TEST') {
        console.log(tles);
      } else {
        // 6. save TleFile on S3
        await this.s3Handler.uploadTleFile(localTleFilePath, s3FileName);

        // 7. save TleModels on DB
        await TleRepository.saveTleModelsOnDB(tles);
      }
      console.log(`Save satellite TLE at : ${dateObj.formatString}`);
    } catch (err) {
      console.log(err);
      if (MODE !== 'TEST') {
        await SendEmailHandler.sendMail(
          '[SPACEMAP] tle task 에서 에러가 발생하였습니다.',
          err
        );
      }
    } finally {
      this.excuting = false;
      console.log('tle scheduler finish.');
    }
  }
}

module.exports = TleTask;
