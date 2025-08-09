const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Firebase Admin SDK initialization
const serviceAccount = require('./firebaseServiceKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.post('/api/messages', async (req, res) => {
  try {
    const { name, location, message } = req.body;
    await db.collection('disasterReports').add({
      name,
      location,
      message,
      createdAt: new Date(),
    });
    res.status(201).json({ message: 'Message saved to Firestore' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const snapshot = await db
      .collection('disasterReports')
      .orderBy('createdAt', 'desc')
      .get();
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('API is running with Firebase...');
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
