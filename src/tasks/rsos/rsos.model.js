const mongoose = require('mongoose');

const { Schema } = mongoose;
const RsosScheme = new Schema({
  id: {
    type: Number,
    required: true,
  },
  objtype: {
    type: String,
    default: 'UNKNOWN',
  },
  objectname: {
    type: String,
    default: 'UNKNOWN',
  },
  rcssize: {
    type: String,
    default: 'UNKNOWN',
  },
  country: {
    type: String,
    default: 'UNKNOWN',
  },
});

module.exports = mongoose.model('rsos', RsosScheme);
