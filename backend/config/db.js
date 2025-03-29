require('dotenv').config()
const mongoose = require('mongoose'); 
const { MongoClient, ServerApiVersion } = require('mongodb');

const connectionString = process.env.MONGODB_URI;
const client = new MongoClient(connectionString, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function connectDB() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    return client;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}


async function connectMongoose() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Mongoose connected to MongoDB!");
  } catch (error) {
    console.error("❌ Mongoose connection error:", error);
    throw error;
  }
}

// Database initialization function
async function initializeDatabase() {
  try {
    const db = client.db('HonkaiStarRailDB');

    // Create collections if they don't exist
    await db.createCollection('characters');
    await db.createCollection('lightCones');
    await db.createCollection('relics');
    await db.createCollection('materials');

    // Create indexes for common queries
    await db.collection('characters').createIndex({ name: 1 }, { unique: true });
    await db.collection('characters').createIndex({ rarity: 1 });
    await db.collection('characters').createIndex({ path: 1 });
    await db.collection('characters').createIndex({ element: 1 });

    await db.collection('lightCones').createIndex({ name: 1 }, { unique: true });
    await db.collection('lightCones').createIndex({ path: 1 });
    await db.collection('lightCones').createIndex({ rarity: 1 });

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database', error);
  }
}

module.exports = { connectDB, connectMongoose, client };