const mongoose = require('mongoose');
const { client } = require('../config/db');

const LightConeSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
  path: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  imageUrl: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  releaseDate: {
    type: Date,
    default: null
  },
  name: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: null
  },
  stats: {
    type: Object,
    default: {}
  },
  rarity: {
    type: Number,
    required: true
  },
  schemaVersion: {
    type: String,
    default: "v1.0"
  }
});

// Create a Mongoose model but also provide direct access to the collection
const LightCone = mongoose.model('LightCone', LightConeSchema);

// Helper function to get the collection directly from the MongoDB client
const getLightConesCollection = () => {
  return client.db('HonkaiStarRailDB').collection('lightCones');
};

module.exports = {
  LightCone,
  getLightConesCollection
};