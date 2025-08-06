const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000'
}));

// Parse JSON
app.use(express.json());

// Middlewares
app.use(express.json());

// MongoDB connection (replace with your actual string)
mongoose.connect('mongodb+srv://admin:cnCyba@cluster0.bmhlhmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB connected successfully.");
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});


// Schema
const messageSchema = new mongoose.Schema({
    name: String,
    location: String,
    message: String,
    time: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);

// Routes
app.post('/send-message', async (req, res) => {
    try {
        const { name, location, message } = req.body;

        // Basic validation
        if (!name || !location || !message) {
            return res.status(400).send('All fields are required');
        }

        const newMsg = new Message({ name, location, message });
        await newMsg.save();
        res.status(200).send('Message stored successfully');
    } catch (error) {
        console.error('Error in /send-message:', error);
        res.status(500).send('Server Error');
    }
});


//Error logger
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ time: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
