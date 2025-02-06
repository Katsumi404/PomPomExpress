function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next(); // User is authenticated, continue to the next middleware/route handler
    }
    res.status(401).json({ message: 'Not authorized' }); // Otherwise, return a 401 response
  }
  
  module.exports = { ensureAuthenticated };