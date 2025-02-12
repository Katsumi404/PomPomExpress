const express = require('express');
const router = express.Router();
const { client } = require('../config/db'); // Import the native MongoDB client

// Reference the database and collection
const dbName = 'sample_airbnb'; // Replace with your database name
const collectionName = 'listingsAndReviews';

// Route to get all listings (limited to 10 for testing)
router.get('/', async (req, res) => {
  try {
    const listings = await client.db(dbName).collection(collectionName).find({}).limit(10).toArray();
    res.json(listings);
    console.log(`✅ Fetched Listings`)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listings" });
    console.log(`❌ Listings not able to fetch`)
  }
});

// Route to get a single listing by ID
router.get('/:id', async (req, res) => {
  try {
    // Make sure to convert the id to ObjectId if needed:
    const { ObjectId } = require('mongodb');
    const listing = await client.db(dbName).collection(collectionName).findOne({ _id: new ObjectId(req.params.id) });
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listing" });
  }
});

module.exports = router;