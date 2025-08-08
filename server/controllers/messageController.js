const Message = require("../models/messageModel");

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const postMessage = async (req, res) => {
  try {
    const { name, location, message } = req.body;
    console.log("Received:", { name, location, message }); // ✅ log incoming payload

    if (!name || !location || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newMsg = await Message.create({ name, location, message });
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getMessages, postMessage };