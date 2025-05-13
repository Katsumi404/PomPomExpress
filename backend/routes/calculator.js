const express = require('express');
const router = express.Router();
const { client } = require('../config/db');

// Database name constant
const dbName = 'HonkaiStarRailDB';

/**
 * Helper: fetch summary (id & name) for any collection
 * With optional limit parameter (set to 0 for no limit)
 */
async function fetchSummary(collectionName, limit = 0) {
  const coll = client.db(dbName).collection(collectionName);
  const docs = await coll.find({}, { projection: { name: 1 } }).limit(limit).toArray();
  return docs.map(doc => ({ id: doc._id.toHexString(), name: doc.name }));
}

/**
 * Console-log only summaries (id & name)
 */
router.get('/logCharactersSummary', async (_req, res) => {
  try {
    const summary = await fetchSummary('characters', 0); 
    console.log('🔍 Character Summaries:', summary);
    res.status(200).json(summary); 
  } catch (error) {
    console.log('❌ Failed to fetch character summaries:', error.message);
    res.status(500).send();
  }
});

router.get('/logMaterialsSummary', async (_req, res) => {
  try {
    const summary = await fetchSummary('materials', 0);
    console.log('🔍 Material Summaries:', summary);
    res.status(200).json({summary});
  } catch (error) {
    console.log('❌ Failed to fetch material summaries:', error.message);
    res.status(500).send();
  }
});

router.get('/logLightConesSummary', async (_req, res) => {
  try {
    const summary = await fetchSummary('lightCones', 0); 
    console.log('🔍 LightCone Summaries:', summary);
    res.status(200).json(summary); 
  } catch (error) {
    console.log('❌ Failed to fetch lightcone summaries:', error.message);
    res.status(500).send();
  }
});

router.get('/logRelicsSummary', async (_req, res) => {
  try {
    const summary = await fetchSummary('relics', 0);
    console.log('🔍 Relic Summaries:', summary);
    res.status(200).json(summary); 
  } catch (error) {
    console.log('❌ Failed to fetch relic summaries:', error.message);
    res.status(500).send();
  }
});

router.get('/logCurrenciesSummary', async (_req, res) => {
  try {
    const summary = await fetchSummary('currencies', 0); 
    console.log('🔍 Currency Summaries:', summary);
    res.status(200).json(summary); 
  } catch (error) {
    console.log('❌ Failed to fetch currency summaries:', error.message);
    res.status(500).send();
  }
});

module.exports = router;