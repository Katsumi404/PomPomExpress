const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb'); // Added this import
const { client } = require('../config/db'); 
const { getCharactersCollection } = require('../models/Characters');
const { getCurrenciesCollection } = require('../models/Currencies');
const { getLightConesCollection } = require('../models/Lightcones');
const { getMaterialsCollection } = require('../models/Materials');
const { getRelicsCollection } = require('../models/Relics');

// Reference the database and collection
const dbName = 'HonkaiStarRailDB';

// CHARACTERS ROUTES

// POST route to add a character
router.post('/addCharacters', async (req, res) => {
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

// Route to get all characters (limited to 10 for testing)
router.get('/getCharacters', async (req, res) => {
  try {
    const charactersCollection = getCharactersCollection();
    const characters = await charactersCollection.find({}).toArray();
    res.json(characters);
    console.log(`✅ Fetched Characters`);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch characters" });
    console.log(`❌ Characters not able to fetch`, error);
  }
});

// Route to get a single character by ID
router.get('/getCharacters/:id', async (req, res) => {
  try {
    const charactersCollection = getCharactersCollection();
    const character = await charactersCollection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }
    
    res.json(character);
    console.log(`✅ Fetched Character with ID: ${req.params.id}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch character" });
    console.log(`❌ Character not able to fetch`, error);
  }
});


// LIGHT CONES ROUTES

// POST route to add a light cone
router.post('/addLightCones', async (req, res) => {
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

// Route to get all light cones (limited to 10 for testing)
router.get('/getLightCones', async (req, res) => {
  try {
    const lightConesCollection = getLightConesCollection();
    const lightCones = await lightConesCollection.find({}).toArray();
    res.json(lightCones);
    console.log(`✅ Fetched Light Cones`);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch light cones" });
    console.log(`❌ Light Cones not able to fetch`, error);
  }
});

// Route to get a single light cone by ID
router.get('/getLightCones/:id', async (req, res) => {
  try {
    const lightConesCollection = getLightConesCollection();
    const lightCone = await lightConesCollection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!lightCone) {
      return res.status(404).json({ error: "Light Cone not found" });
    }
    
    res.json(lightCone);
    console.log(`✅ Fetched Light Cone with ID: ${req.params.id}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch light cone" });
    console.log(`❌ Light Cone not able to fetch`, error);
  }
});


// MATERIALS ROUTES

// POST route to add a material
router.post('/addMaterials', async (req, res) => {
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

// Route to get all materials (limited to 10 for testing)
router.get('/getMaterials', async (req, res) => {
  try {
    const materialsCollection = getMaterialsCollection();
    const materials = await materialsCollection.find({}).limit(10).toArray();
    res.json(materials);
    console.log(`✅ Fetched Materials`);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch materials" });
    console.log(`❌ Materials not able to fetch`, error);
  }
});

// Route to get a single material by ID
router.get('/getMaterials/:id', async (req, res) => {
  try {
    const materialsCollection = getMaterialsCollection();
    const material = await materialsCollection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    
    res.json(material);
    console.log(`✅ Fetched Material with ID: ${req.params.id}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch material" });
    console.log(`❌ Material not able to fetch`, error);
  }
});


// RELICS ROUTES

// POST route to add a relic
router.post('/addRelics', async (req, res) => {
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

// Route to get all relics (limited to 10 for testing)
router.get('/getRelics', async (req, res) => {
  try {
    const relicsCollection = getRelicsCollection();
    const relics = await relicsCollection.find({}).toArray();
    res.json(relics);
    console.log(`✅ Fetched Relics`);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch relics" });
    console.log(`❌ Relics not able to fetch`, error);
  }
});

// Route to get a single relic by ID
router.get('/getRelics/:id', async (req, res) => {
  try {
    const relicsCollection = getRelicsCollection();
    const relic = await relicsCollection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!relic) {
      return res.status(404).json({ error: "Relic not found" });
    }
    
    res.json(relic);
    console.log(`✅ Fetched Relic with ID: ${req.params.id}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch relic" });
    console.log(`❌ Relic not able to fetch`, error);
  }
});

// CURRENCY ROUTES

// POST route to add a currency
router.post('/addCurrencies', async (req, res) => {
  try {
    const currency = req.body;
    const currenciesCollection = getCurrenciesCollection();
    const result = await currenciesCollection.insertOne(currency);
    
    res.status(201).json({ 
      message: "Currency added successfully", 
      id: result.insertedId 
    });
    console.log(`✅ Currency added: ${currency.name}`);
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ error: "Currency with this name already exists" });
    } else {
      res.status(500).json({ error: "Failed to add currency" });
      console.log(`❌ Currency not added: ${error.message}`);
    }
  }
});

// Route to get all currencies (limited to 10 for testing)
router.get('/getCurrencies', async (req, res) => {
  try {
    const currenciesCollection = getCurrenciesCollection();
    const currencies = await currenciesCollection.find({}).limit(10).toArray();
    res.json(currencies);
    console.log(`✅ Fetched Currencies`);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch currencies" });
    console.log(`❌ Currencies not able to fetch`, error);
  }
});

// Route to get a single currency by ID
router.get('/getCurrencies/:id', async (req, res) => {
  try {
    const currenciesCollection = getCurrenciesCollection();
    const currency = await currenciesCollection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!currency) {
      return res.status(404).json({ error: "Currency not found" });
    }
    
    res.json(currency);
    console.log(`✅ Fetched Currency with ID: ${req.params.id}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch currency" });
    console.log(`❌ Currency not able to fetch`, error);
  }
});

module.exports = router;