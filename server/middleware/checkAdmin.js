// server/middleware/checkAdmin.js
const admin = require('firebase-admin');

// Ensure Firebase Admin was initialized in server.js
function ensureAdminInitialized() {
  if (!admin.apps.length) {
    throw new Error(
      'Firebase Admin is not initialized. Make sure to call admin.initializeApp() in server.js first.'
    );
  }
}

module.exports = async function checkAdmin(req, res, next) {
  try {
    ensureAdminInitialized();

    // Extract bearer token from Authorization header
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length)
      : null;

    if (!token) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    // Verify token using Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Check custom claim
    if (decodedToken.admin === true) {
      req.user = decodedToken; // attach token info if needed later
      return next();
    } else {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

  } catch (error) {
    console.error('Admin check failed:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
