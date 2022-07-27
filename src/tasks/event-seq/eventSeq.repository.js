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

  static async setPredictionWindow(dateObj) {
    await this.#deletePredictionWindow();
    const endMoment = DateHandler.getDateOfSameHourNextDay(
      dateObj,
      2
    ).obj.toISOString();
    const startMoment = dateObj.obj.toISOString();
    await this.#setMomentsOfPredictionWindow(startMoment, endMoment);
    // await this.#setStartMomentOfPredictionWindow(dateObj.obj.toISOString());
    // await this.#setEndMomentOfPredictionWindow(endMoment.obj.toISOString());
  }

  static async #setMomentsOfPredictionWindow(startMoment, endMoment) {
    await PredictionWindow.insertMany({ startMoment, endMoment });
  }

  static async #deletePredictionWindow() {
    await PredictionWindow.deleteOne();
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
