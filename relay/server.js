require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const mongoose = require('mongoose');

// Import the Logic Core
const { handleInterviewConnection } = require('./services/liveInterview');

const app = express();
app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB Error:', err));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Delegate to handler
wss.on('connection', (ws, req) => {
    handleInterviewConnection(ws, req);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Relay Server running on port ${PORT}`);
});