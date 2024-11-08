const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  extraInfo: String,
});

const Data = mongoose.model('Data', dataSchema);

module.exports = Data;