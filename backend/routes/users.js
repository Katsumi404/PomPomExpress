const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ObjectId } = require('mongodb');
const { client } = require('../config/db');
const User = require('../models/Users');

// Get all users
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Role-based authorization goes here
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reference the database
const dbName = 'UserDataDB';

// Function to get users collection
const getUsersCollection = () => {
  return client.db(dbName).collection('users');
};

// Function to get or create collections for a user
const getUserCollections = async (userId) => {
  try {
    const usersCollection = getUsersCollection();
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      user,
      charactersCollection: client.db(dbName).collection('characters'),
      lightConesCollection: client.db(dbName).collection('lightcones'),
      relicsCollection: client.db(dbName).collection('relics'), // Add relics collection
    };
  } catch (error) {
    throw error;
  }
};

// Add a character to user's collection
router.post('/addCharacterToCollection', async (req, res) => {
  try {
    const { userId, characterId } = req.body;

    if (!userId || !characterId) {
      return res.status(400).json({ error: "User ID and Character ID are required" });
    }

    const { charactersCollection } = await getUserCollections(userId);

    // Check if character already exists in collection
    const existingCharacter = await charactersCollection.findOne({
      userId: new ObjectId(userId),
      characterId: new ObjectId(characterId)
    });

    if (existingCharacter) {
      return res.status(409).json({ message: "Character already in collection" });
    }

    // Add character to user's collection
    const result = await charactersCollection.insertOne({
      userId: new ObjectId(userId),
      characterId: new ObjectId(characterId),
      dateAdded: new Date(),
      level: 1,
      eidolon: 0,
      isFavorite: false
    });

    res.status(201).json({
      message: "Character added to collection",
      id: result.insertedId
    });
    console.log(`✅ Character added to collection for user: ${userId}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to add character to collection" });
    console.log(`❌ Failed to add character to collection: ${error.message}`);
  }
});

// Add a light cone to user's collection
router.post('/addLightConeToCollection', async (req, res) => {
  try {
    const { userId, lightConeId, stats } = req.body;

    if (!userId || !lightConeId) {
      return res.status(400).json({ error: "User ID and Light Cone ID are required" });
    }

    const { lightConesCollection } = await getUserCollections(userId);

    const result = await lightConesCollection.insertOne({
      userId: new ObjectId(userId),
      lightConeId: new ObjectId(lightConeId),
      dateAdded: new Date(),
      level: 1,
      superimposition: 1,
      stats: stats || {},
      isFavorite: false
    });

    res.status(201).json({
      message: "Light Cone added to collection",
      id: result.insertedId
    });
    console.log(`✅ Light Cone added to collection for user: ${userId}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to add light cone to collection" });
    console.log(`❌ Failed to add light cone to collection: ${error.message}`);
  }
});

// Add a relic to user's collection
router.post('/addRelicToCollection', async (req, res) => {
  try {
    const { userId, relicId, mainStats, subStats, pieceType } = req.body;

    if (!userId || !relicId) {
      return res.status(400).json({ error: "User ID and Relic ID are required" });
    }

    const validPieceTypes = ['Head', 'Hands', 'Body', 'Feet', 'Planar Sphere', 'Link Rope'];
    const defaultPieceType = pieceType && validPieceTypes.includes(pieceType) 
      ? pieceType 
      : 'Head'; 

    const { relicsCollection } = await getUserCollections(userId);

    const result = await relicsCollection.insertOne({
      userId: new ObjectId(userId),
      relicId: new ObjectId(relicId),
      dateAdded: new Date(),
      level: 1,
      mainStats: mainStats || {},
      subStats: subStats || {},
      isFavorite: false,
      pieceType: defaultPieceType
    });

    res.status(201).json({
      message: "Relic added to collection",
      id: result.insertedId,
      pieceType: defaultPieceType
    });
    console.log(`✅ Relic added to collection for user: ${userId}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to add relic to collection" });
    console.log(`❌ Failed to add relic to collection: ${error.message}`);
  }
});

// Get user's character collection
router.get('/getUserCharacters/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { charactersCollection } = await getUserCollections(userId);

    // Aggregate to join with HonkaiStarRailDB characters
    const pipeline = [
      {
        $match: { userId: new ObjectId(userId) }
      },
      {
        $lookup: {
          from: 'HonkaiStarRailDB.characters',
          localField: 'characterId',
          foreignField: '_id',
          as: 'characterDetails'
        }
      },
      {
        $unwind: '$characterDetails'
      }
    ];

    const userCharacters = await charactersCollection.aggregate(pipeline).toArray();
    res.json(userCharacters);
    console.log(`✅ Fetched characters for user: ${userId}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user's characters" });
    console.log(`❌ Failed to fetch user's characters: ${error.message}`);
  }
});

// Get user's light cone collection
router.get('/getUserLightCones/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { lightConesCollection } = await getUserCollections(userId);

    // Aggregate to join with HonkaiStarRailDB light cones
    const pipeline = [
      {
        $match: { userId: new ObjectId(userId) }
      },
      {
        $lookup: {
          from: 'HonkaiStarRailDB.lightCones',
          localField: 'lightConeId',
          foreignField: '_id',
          as: 'lightConeDetails'
        }
      },
      {
        $unwind: '$lightConeDetails'
      }
    ];

    const userLightCones = await lightConesCollection.aggregate(pipeline).toArray();
    res.json(userLightCones);
    console.log(`✅ Fetched light cones for user: ${userId}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user's light cones" });
    console.log(`❌ Failed to fetch user's light cones: ${error.message}`);
  }
});

router.get('/getUserRelics/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { relicsCollection } = await getUserCollections(userId);

    // Debug: Check if collection exists
    if (!relicsCollection) {
      return res.status(500).json({ error: "Failed to get relics collection" });
    }

    const pipeline = [
      {
        $match: { userId: new ObjectId(userId) },
      },
      {
        $lookup: {
          from: 'relics', 
          localField: 'relicId',
          foreignField: '_id',
          as: 'relicDetails',
        },
      },
      {
        $unwind: {
          path: '$relicDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          relicId: 1,
          name: { $ifNull: ['$relicDetails.name', 'Unknown Relic'] },
          rarity: { $ifNull: ['$relicDetails.rarity', 0] },
          mainStats: 1,
          subStats: 1,
          level: 1,
          isFavorite: 1,
          dateAdded: 1,
          pieceType: 1, 
        },
      },
    ];

    const userRelics = await relicsCollection.aggregate(pipeline).toArray();
    
    // Debug: Log the first result
    if (userRelics.length > 0) {
      console.log("First relic in response:", userRelics[0]);
    } else {
      console.log("No relics found for user", userId);
    }

    res.json(userRelics);
  } catch (error) {
    console.error("Error fetching user relics:", error);
    res.status(500).json({ error: "Failed to fetch user's relics with details", details: error.message });
  }
});

// Update user's character
router.put('/updateUserCharacter/:id', async (req, res) => {
  try {
    const { level, eidolon, isFavorite } = req.body;
    const characterId = req.params.id;

    const { charactersCollection } = await getUserCollections(req.body.userId);

    const updateFields = {};
    if (level !== undefined) updateFields.level = level;
    if (eidolon !== undefined) updateFields.eidolon = eidolon;
    if (isFavorite !== undefined) updateFields.isFavorite = isFavorite;

    const result = await charactersCollection.updateOne(
      { _id: new ObjectId(characterId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Character not found in collection" });
    }

    res.json({ message: "Character updated successfully" });
    console.log(`✅ Updated character in collection: ${characterId}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to update character" });
    console.log(`❌ Failed to update character: ${error.message}`);
  }
});

// Update user's light cone
router.put('/updateUserLightCone/:id', async (req, res) => {
  try {
    const { level, superimposition, stats, isFavorite } = req.body;
    const lightConeId = req.params.id;

    const { lightConesCollection } = await getUserCollections(req.body.userId);

    const updateFields = {};
    if (level !== undefined) updateFields.level = level;
    if (superimposition !== undefined) updateFields.superimposition = superimposition;
    if (stats !== undefined) updateFields.stats = stats;
    if (isFavorite !== undefined) updateFields.isFavorite = isFavorite;

    const result = await lightConesCollection.updateOne(
      { _id: new ObjectId(lightConeId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Light Cone not found in collection" });
    }

    res.json({ message: "Light Cone updated successfully" });
    console.log(`✅ Updated light cone in collection: ${lightConeId}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to update light cone" });
    console.log(`❌ Failed to update light cone: ${error.message}`);
  }
});

// Update user's relic
router.put('/updateUserRelic/:id', async (req, res) => {
  try {
    const { level, mainStats, subStats, isFavorite, pieceType } = req.body; 
    const relicId = req.params.id;

    const { relicsCollection } = await getUserCollections(req.body.userId);

    const updateFields = {};
    if (level !== undefined) updateFields.level = level;
    if (mainStats !== undefined) updateFields.mainStats = mainStats; 
    if (subStats !== undefined) updateFields.subStats = subStats;    
    if (isFavorite !== undefined) updateFields.isFavorite = isFavorite;
    if (pieceType !== undefined) updateFields.pieceType = pieceType;

    const result = await relicsCollection.updateOne(
      { _id: new ObjectId(relicId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Relic not found in collection" });
    }

    res.json({ message: "Relic updated successfully" });
    console.log(`✅ Updated relic in collection: ${relicId}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to update relic" });
    console.log(`❌ Failed to update relic: ${error.message}`);
  }
});

// Remove character from collection
router.delete('/removeCharacterFromCollection/:userId/:characterId', async (req, res) => {
  try {
    const { userId, characterId } = req.params;

    const { charactersCollection } = await getUserCollections(userId);

    const result = await charactersCollection.deleteOne({
      userId: new ObjectId(userId),
      _id: new ObjectId(characterId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Character not found in collection" });
    }

    res.json({ message: "Character removed from collection" });
    console.log(`✅ Removed character from collection: ${characterId}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to remove character from collection" });
    console.log(`❌ Failed to remove character: ${error.message}`);
  }
});

// Remove light cone from collection
router.delete('/removeLightConeFromCollection/:userId/:lightConeId', async (req, res) => {
  try {
    const { userId, lightConeId } = req.params;

    const { lightConesCollection } = await getUserCollections(userId);

    const result = await lightConesCollection.deleteOne({
      userId: new ObjectId(userId),
      _id: new ObjectId(lightConeId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Light Cone not found in collection" });
    }

    res.json({ message: "Light Cone removed from collection" });
    console.log(`✅ Removed light cone from collection: ${lightConeId}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to remove light cone from collection" });
    console.log(`❌ Failed to remove light cone: ${error.message}`);
  }
});

// Remove relic from collection
router.delete('/removeRelicFromCollection/:userId/:relicId', async (req, res) => {
  try {
    const { userId, relicId } = req.params;

    const { relicsCollection } = await getUserCollections(userId);

    const result = await relicsCollection.deleteOne({
      userId: new ObjectId(userId),
      _id: new ObjectId(relicId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Relic not found in collection" });
    }

    res.json({ message: "Relic removed from collection" });
    console.log(`✅ Removed relic from collection: ${relicId}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to remove relic from collection" });
    console.log(`❌ Failed to remove relic: ${error.message}`);
  }
});

module.exports = router;
