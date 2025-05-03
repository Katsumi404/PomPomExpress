const mongoose = require('mongoose');
const { client } = require('../config/db');

const RelicSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
  setPieces: {
    type: [Number],
    default: []
  },
  rarity: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  }
});

// Create a Mongoose model but also provide direct access to the collection
const Relic = mongoose.model('Relic', RelicSchema);

// Helper function to get the collection directly from the MongoDB client
const getRelicsCollection = () => {
  return client.db('HonkaiStarRailDB').collection('relics');
};

module.exports = {
  Relic,
  getRelicsCollection
};