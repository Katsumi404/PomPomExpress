const mongoose = require('mongoose');
const { client } = require('../config/db');

const CurrencySchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  icon: {
    type: String,
    default: ""
  },
  updatedAt: {
    type: Date,
    default: null
  },
  schemaVersion: {
    type: String,
    default: "v1.0"
  }
});

// Create a Mongoose model but also provide direct access to the collection
const Currency = mongoose.model('Currency', CurrencySchema);

// Helper function to get the collection directly from the MongoDB client
const getCurrenciesCollection = () => {
  return client.db('HonkaiStarRailDB').collection('currencies');
};

module.exports = {
  Currency,
  getCurrenciesCollection
};