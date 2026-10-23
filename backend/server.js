require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const Event = require('./models/Event');
const Feedback = require('./models/Feedback');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas Connected'))
  .catch(err => console.log(err));

// --- PUBLIC ROUTES ---
app.get('/api/events', async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  res.json(events);
});

app.post('/api/feedback', async (req, res) => {
  try {
    const newFeedback = new Feedback(req.body);
    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit' });
  }
});

// --- ADMIN SECURITY ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ role: 'admin' }, process.env.SECRET_KEY, { expiresIn: '2h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token required');
  try {
    jwt.verify(token.split(" ")[1], process.env.SECRET_KEY);
    next();
  } catch (err) {
    res.status(401).send('Invalid Token');
  }
};

// --- PROTECTED ADMIN ROUTES ---
app.post('/api/admin/events', verifyToken, async (req, res) => {
  try {
    const newEvent = new Event({ name: req.body.name });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create event' });
  }
});

app.get('/api/admin/data', verifyToken, async (req, res) => {
  const feedbacks = await Feedback.find().sort({ createdAt: -1 });
  const totalFeedback = feedbacks.length;
  const avgRating = feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / (totalFeedback || 1);
  res.json({ feedbacks, stats: { totalFeedback, avgRating: avgRating.toFixed(1) } });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));