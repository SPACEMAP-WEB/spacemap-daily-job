const { DateHandler } = require('../../library');
const PredictionWindow = require('./eventSeq.model');

class EventSeqRepository {
  static async #setStartMomentOfPredictionWindow(startMoment) {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    await PredictionWindow.findByIdAndUpdate(
      '6287a167652f57b94bcb2977',
      { startMoment },
      options
    );
  }

  static async #setEndMomentOfPredictionWindow(endMoment) {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    await PredictionWindow.findByIdAndUpdate(
      '6287a167652f57b94bcb2977',
      { endMoment },
      options
    );
  }

  /**
   * @param { moment.Moment } momentObj
   */
  static async setPredictionWindow(momentObj) {
    await this.#setStartMomentOfPredictionWindow(momentObj.toISOString());

    const endMoment = DateHandler.getDateOfSameHourNextDay(momentObj, 2);
    await this.#setEndMomentOfPredictionWindow(endMoment.toISOString());
  }

  static async #getStartMomentOfPredictionWindow() {
    const result = await PredictionWindow.findOne().exec();
    return result.startMoment;
  }

  static async #getEndMomentOfPredictionWindow() {
    const result = await PredictionWindow.findOne().exec();
    return result.endMoment;
  }

  static async isValidLaunchEpochTime(launchEpochTime) {
    const startMoment = await this.#getStartMomentOfPredictionWindow();
    const endMoment = await this.#getEndMomentOfPredictionWindow();
    return DateHandler.isValidLaunchEpochTime(
      launchEpochTime,
      startMoment,
      endMoment
    );
  }

  static async getDiffSeconds(launchEpochTime) {
    const startMoment = await this.#getStartMomentOfPredictionWindow();
    return DateHandler.getDiffSeconds(launchEpochTime, startMoment);
  }
}

module.exports = EventSeqRepository;