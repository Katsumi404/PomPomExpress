const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/Users');

// Get all users (protected admin route example)
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      // You might want to add role-based authorization here
      const users = await User.find().select('-password');
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Other user routes...
  
  module.exports = router;