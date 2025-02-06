const { client } = require('../config/db');

async function getData(req, res) {
  console.log('getData was called');
  try {
    // Access the sample_mflix database
    const db = client.db('sample_airbnb');
    // Query the comments collection
    const data = await db.collection('listingsAndReviews').find().toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getData };