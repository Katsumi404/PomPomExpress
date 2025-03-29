const express = require('express');
const router = express.Router();
const passport = require('passport');
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
  
  // Other user routes...
  
  module.exports = router;