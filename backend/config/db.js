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
    // Send a ping to confirm a successful connection
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

module.exports = { connectDB, connectMongoose, client };