const express = require('express');
const router = express.Router();
const { client } = require('../config/db'); 

// Reference the database and collection
const dbName = 'HonkaiStarRailDB';
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

// POST route to add a character
router.post('/characters', async (req, res) => {
  try {
    const character = req.body;
    const result = await client.db(dbName).collection('characters').insertOne(character);
    
    res.status(201).json({ 
      message: "Character added successfully", 
      id: result.insertedId 
    });
    console.log(`✅ Character added: ${character.name}`);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      res.status(409).json({ error: "Character with this name already exists" });
    } else {
      res.status(500).json({ error: "Failed to add character" });
      console.log(`❌ Character not added: ${error.message}`);
    }
  }
});

// POST route to add a light cone
router.post('/lightCones', async (req, res) => {
  try {
    const lightCone = req.body;
    const result = await client.db(dbName).collection('lightCones').insertOne(lightCone);
    
    res.status(201).json({ 
      message: "Light cone added successfully", 
      id: result.insertedId 
    });
    console.log(`✅ Light cone added: ${lightCone.name}`);
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ error: "Light cone with this name already exists" });
    } else {
      res.status(500).json({ error: "Failed to add light cone" });
      console.log(`❌ Light cone not added: ${error.message}`);
    }
  }
});

// POST route to add a relic
router.post('/relics', async (req, res) => {
  try {
    const relic = req.body;
    const result = await client.db(dbName).collection('relics').insertOne(relic);
    
    res.status(201).json({ 
      message: "Relic added successfully", 
      id: result.insertedId 
    });
    console.log(`✅ Relic added: ${relic.name}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to add relic" });
    console.log(`❌ Relic not added: ${error.message}`);
  }
});

// POST route to add a currency
router.post('/currencies', async (req, res) => {
  try {
    const currency = req.body;
    const result = await client.db(dbName).collection('currencies').insertOne(currency);
    
    res.status(201).json({ 
      message: "Currency added successfully", 
      id: result.insertedId 
    });
    console.log(`✅ Currency added: ${currency.name}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to add currency" });
    console.log(`❌ Currency not added: ${error.message}`);
  }
});

// POST route to add a material
router.post('/materials', async (req, res) => {
  try {
    const material = req.body;
    const result = await client.db(dbName).collection('materials').insertOne(material);
    
    res.status(201).json({ 
      message: "Material added successfully", 
      id: result.insertedId 
    });
    console.log(`✅ Material added: ${material.name}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to add material" });
    console.log(`❌ Material not added: ${error.message}`);
  }
});

module.exports = router;