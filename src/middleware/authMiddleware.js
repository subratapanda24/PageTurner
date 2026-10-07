const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { admin, isFirebaseConfigured } = require('../config/firebase');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 1. Try standard JWT verification
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pageturner_super_secret_jwt_key_2026');
        req.user = await User.findById(decoded.id).select('-password');
        if (req.user) {
          return next();
        }
      } catch (jwtErr) {
        // 2. If JWT fails, check if Firebase ID Token is configured
        if (isFirebaseConfigured && admin) {
          const decodedFirebase = await admin.auth().verifyIdToken(token);
          let user = await User.findOne({ email: decodedFirebase.email }).select('-password');
          if (!user) {
            user = await User.create({
              name: decodedFirebase.name || decodedFirebase.email.split('@')[0],
              email: decodedFirebase.email,
              password: 'firebase_auth_user_' + Math.random().toString(36).substring(7),
              role: 'user',
            });
          }
          req.user = user;
          return next();
        }
        throw jwtErr;
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      console.error('Authentication verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

module.exports = { protect, adminOnly };
