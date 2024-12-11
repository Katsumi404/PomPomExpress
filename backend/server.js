const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());

require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

console.log('MONGODB_URI:', process.env.MONGODB_URI);
const connectionString = process.env.MONGODB_URI;

const client = new MongoClient(connectionString, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// makes sure the requests can be listened to by react expo
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://10.202.135.206:8081',
    'exp://10.202.135.206:8081'
  ]
}));

// gives it an app page
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Example route to fetch data from MongoDB
app.get('/datatest', async (req, res) => {
  try {
    // Example query - replace with actual MongoDB query
    const data = await YourModel.find(); // Replace 'YourModel' with your actual model
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// says what port we are running on (which should be 3000)
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});