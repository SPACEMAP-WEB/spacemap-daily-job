const mongoose = require('mongoose');

const { Schema } = mongoose;

const PpdbScheme = new Schema({
  createdAt: {
    type: Date,
    required: true,
  },
  pid: {
    type: Number,
    required: true,
  },
  pName: {
    type: String,
    required: true,
  },
  sid: {
    type: Number,
    required: true,
  },
  sName: {
    type: String,
    required: true,
  },
  dca: {
    type: Number,
    required: true,
  },
  tcaTime: {
    type: Date,
    required: true,
  },
  tcaStartTime: {
    type: Date,
    required: true,
  },
  tcaEndTime: {
    type: Date,
    required: true,
  },
  standardTime: {
    type: Date,
    required: true,
  },
  probability: {
    type: String,
    required: true,
  },
});

const PpdbModel = mongoose.model('ppdb', PpdbScheme);
PpdbModel.createIndexes({ tcaTime: 1, probability: 1, dca: 1 });

module.exports = PpdbModel;
