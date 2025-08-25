// server/server.js
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const checkAdmin = require('./middleware/checkAdmin');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const adminRoutes = require("./routes/adminRoutes");
const serviceAccount = require('./serviceAccountKey.json');

// ─────────────────── Firebase Admin Initialization ───────────────────
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────── Root Route ───────────────────
app.get('/', (req, res) => {
  res.json({ message: 'API is running with Firebase...' });
});

// ─────────────────── Public Routes ───────────────────
// Users submit messages (no login required)
app.post('/api/messages', async (req, res) => {
  try {
    const { name, message, location } = req.body;
    if (!name || !message) {
      return res.status(400).json({ message: 'Name and message are required' });
    }
    const docRef = await db.collection('messages').add({
      name,
      message,
      location: location || null,
      status: 'pending', // default status
      createdAt: new Date()
    });
    res.status(201).json({ id: docRef.id, name, message, status: 'pending' });
  } catch (err) {
    console.error('Error adding message:', err);
    res.status(500).json({ message: 'Failed to add message' });
  }
});

// Anyone can view recent messages
app.get('/api/messages', async (req, res) => {
  try {
    const snapshot = await db.collection('messages').orderBy('createdAt', 'desc').get();
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// ─────────────────── Admin Setup ───────────────────
// Used once to grant admin rights to a user by email
app.post('/setAdmin', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Missing email' });

    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    res.json({ message: `Admin claim set for ${email}` });
  } catch (err) {
    console.error('Error in /setAdmin:', err);
    res.status(500).json({ message: 'Failed to set admin claim', error: err.message });
  }
});

//------------------ use routes ------------------
app.use('/api/admin', adminRoutes);

// ─────────────────── Admin-Only Routes ───────────────────
// Change message status (pending → resolved)
app.patch('/api/messages/:id', checkAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Missing status' });

    await db.collection('messages').doc(req.params.id).update({ status });
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// Delete a message completely
app.delete('/api/messages/:id', checkAdmin, async (req, res) => {
  try {
    await db.collection('messages').doc(req.params.id).delete();
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

// Example admin-only test route
app.post('/api/admin/task', checkAdmin, (req, res) => {
  res.json({ message: 'This is only for admins.' });
});

// ─────────────────── Error Handlers ───────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
