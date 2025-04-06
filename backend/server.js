const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your React app URL
    methods: ["GET", "POST"]
  }
});

// Store online users
const onlineUsers = {};

// Simple in-memory storage for messages (replace with DB in production)
const messageHistory = {};

// Generate a unique chat ID for two users
const getChatId = (user1, user2) => {
  return [user1, user2].sort().join('-');
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // When a user connects to the chat
  socket.on('user_connected', (userData) => {
    const { userId, username } = userData;
    onlineUsers[userId] = { socketId: socket.id, username };
    
    // Store the userId in the socket for later use
    socket.userId = userId;
    
    // Notify all clients about online users
    io.emit('online_users', Object.keys(onlineUsers).reduce((acc, id) => {
      acc[id] = true;
      return acc;
    }, {}));
    
    console.log(`User ${username} (${userId}) connected`);
  });
  
  // Get previous messages between users
  socket.on('get_message_history', ({ userId, contactId }) => {
    const chatId = getChatId(userId, contactId);
    
    // Send back message history or empty array if no history
    socket.emit('message_history', messageHistory[chatId] || []);
  });
  
  // Handle new messages
  socket.on('send_message', (messageData) => {
    const { senderId, receiverId } = messageData;
    const chatId = getChatId(senderId, receiverId);
    
    // Create unique message id
    const messageWithId = {
      ...messageData,
      id: Date.now().toString(),
      read: false
    };
    
    // Store the message in history
    if (!messageHistory[chatId]) {
      messageHistory[chatId] = [];
    }
    messageHistory[chatId].push(messageWithId);
    
    // Send to receiver if online
    if (onlineUsers[receiverId]) {
      io.to(onlineUsers[receiverId].socketId).emit('receive_message', messageWithId);
    }
    
    // Also send back to sender to confirm delivery
    socket.emit('receive_message', { ...messageWithId, isMine: true });
  });
  
  // Mark message as read
  socket.on('mark_as_read', ({ messageId, userId, contactId }) => {
    const chatId = getChatId(userId, contactId);
    
    if (messageHistory[chatId]) {
      messageHistory[chatId] = messageHistory[chatId].map(msg => {
        if (msg.id === messageId) {
          return { ...msg, read: true };
        }
        return msg;
      });
    }
  });
  
  // Mark all messages as read
  socket.on('mark_all_as_read', ({ userId, contactId }) => {
    const chatId = getChatId(userId, contactId);
    
    if (messageHistory[chatId]) {
      messageHistory[chatId] = messageHistory[chatId].map(msg => {
        if (msg.receiverId === userId && !msg.read) {
          return { ...msg, read: true };
        }
        return msg;
      });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId && onlineUsers[socket.userId]) {
      console.log(`User ${onlineUsers[socket.userId].username} disconnected`);
      delete onlineUsers[socket.userId];
      
      // Notify remaining users about updated online status
      io.emit('online_users', Object.keys(onlineUsers).reduce((acc, id) => {
        acc[id] = true;
        return acc;
      }, {}));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});