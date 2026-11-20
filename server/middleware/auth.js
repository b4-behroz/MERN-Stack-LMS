const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT and attaches the user to req
exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

// Restricts a route to the given roles
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied for role "${req.user.role}"` });
  }
  next();
};
