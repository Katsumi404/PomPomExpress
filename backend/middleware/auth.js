// middleware/auth.js
const passport = require('passport');

exports.protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, no token or invalid token' });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

// Optional: Role-based authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized for this route' });
    }
    next();
  };
};