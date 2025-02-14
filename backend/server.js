// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());

// Include route files
const authRoute = require('./routes/auth');
const calculatorRoute = require('./routes/calculator');
const dbRoute = require('./routes/db');
const usersRoute = require('./routes/users');

// Use routes
const { connectDB } = require('./config/db');
app.use('/auth', authRoute);
app.use('/calculator', calculatorRoute);
app.use('/db', dbRoute);
app.use('/users', usersRoute);

// makes sure the requests can be listened to by react expo
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://10.202.134.48:3000',
    'http://10.202.134.48:8081'
  ],
  methods: ['GET', 'POST'], // Add any methods that your API will support
  allowedHeaders: ['Content-Type'],
}));

// Connect to MongoDB and then start the server.
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error(`❌ Failed to connect to MongoDB`, err);
  });