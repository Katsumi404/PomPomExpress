const mongoose = require('mongoose');
const { client } = require('../config/db');

const CharacterSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
  element: {
    type: String,
    required: true
  },
  voiceActor: {
    type: String,
    default: ""
  },
  rarity: {
    type: Number,
    required: true
  },
  abilities: {
    type: [String],
    default: []
  },
  tags: {
    type: [String], 
    default: []
  },
  name: {
    type: String,
    required: true
  },
  baseStats: {
    type: Object,
    default: {}
  },
  releaseDate: {
    type: Date,
    default: null
  },
  path: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: null
  },
  schemaVersion: {
    type: String,
    default: "v1.0"
  },
  imageUrl: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  }
});

// Create a Mongoose model but also provide direct access to the collection
const Character = mongoose.model('Character', CharacterSchema);

// Helper function to get the collection directly from the MongoDB client
const getCharactersCollection = () => {
  return client.db('HonkaiStarRailDB').collection('characters');
};

module.exports = {
  Character,
  getCharactersCollection
};