const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/Users');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// Register a new user
router.post('/register', async (req, res) => {
  try {
    // Extract fields from the request body
    const { firstName, lastName, email, password, birthday } = req.body;

    // Validate input: Ensure all necessary fields are provided
    if (!firstName || !lastName || !email || !password || !birthday) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user with all provided fields
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      birthday
    });

    // Save user to the database
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    // Respond with user info and token
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        birthday: user.birthday
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get current user profile (protected route)
router.get('/profile', 
  passport.authenticate('jwt', { session: false }), 
  (req, res) => {
    console.log('Authenticated user data:', req.user)

    res.json({
      id: req.user._id,
      firstName: req.user.firstName, 
      lastName: req.user.lastName,
      email: req.user.email,
      birthday: req.user.birthday 
    });
  }
);

// Update user profile (protected route)
router.put('/updateProfile',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { firstName, lastName, email, birthday } = req.body;
      
      // Optional: Validate inputs
      if (!firstName && !lastName && !email && !birthday) {
        return res.status(400).json({ message: 'No fields to update provided' });
      }
      
      // Find the user and update their profile
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(email && { email }),
            ...(birthday && { birthday })
          }
        },
        { new: true } // Return the updated document
      );
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return updated user data
      res.json({
        success: true,
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          birthday: updatedUser.birthday
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// Route to delete a user by ID
router.delete('/delete', async (req, res) => {
  try {
    const { email } = req.body;  // Get email from the request body

    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required to delete user' });
    }

    // Try to find and delete the user by email
    const deletedUser = await User.findOneAndDelete({ email });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return a success message if the user is deleted
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

module.exports = router;