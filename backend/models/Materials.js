const mongoose = require('mongoose');
const { client } = require('../config/db');

const MaterialSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
  name: {
    type: String,
    required: true
  },
  source: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ""
  },
  icon: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    required: false
  },
  rarity: {
    type: Number,
    required: false
  }
});

// Create a Mongoose model but also provide direct access to the collection
const Material = mongoose.model('Material', MaterialSchema);

// Helper function to get the collection directly from the MongoDB client
const getMaterialsCollection = () => {
  return client.db('HonkaiStarRailDB').collection('materials');
};

module.exports = {
  Material,
  getMaterialsCollection
};