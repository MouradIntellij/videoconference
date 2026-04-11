import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import { createServer } from 'http'; // 🔥 IMPORTANT
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

// ✅ créer le serveur HTTP
const httpServer = createServer(app);

// ✅ Socket.IO attaché au serveur
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://videoconference-server-delta.vercel.app\n' // 🔥 à remplacer
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Store rooms and users
const rooms = new Map();
const users = new Map();

// REST API
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  if (room) {
    res.json({ exists: true, participants: room.participants });
  } else {
    res.json({ exists: false });
  }
});

app.post('/api/rooms', (req, res) => {
  const roomId = uuidv4();

  rooms.set(roomId, {
    id: roomId,
    participants: [],
    createdAt: new Date().toISOString()
  });

  res.json({ roomId });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room
  socket.on('join-room', ({ roomId, userId, userName }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        participants: [],
        createdAt: new Date().toISOString()
      });
    }

    const user = { id: userId, name: userName, socketId: socket.id };
    users.set(socket.id, { ...user, roomId });
    rooms.get(roomId).participants.push(user);

    // Notify others
    socket.to(roomId).emit('user-joined', user);
    
    // Send current participants
    socket.emit('room-participants', rooms.get(roomId).participants);
    
    console.log(`User ${userName} joined room ${roomId}`);
  });

  // WebRTC signaling
  socket.on('offer', ({ offer, targetUserId, roomId }) => {
    socket.to(roomId).emit('offer', { offer, fromUserId: socket.id, targetUserId });
  });

  socket.on('answer', ({ answer, targetUserId, roomId }) => {
    socket.to(roomId).emit('answer', { answer, fromUserId: socket.id, targetUserId });
  });

  socket.on('ice-candidate', ({ candidate, targetUserId, roomId }) => {
    socket.to(roomId).emit('ice-candidate', { candidate, fromUserId: socket.id, targetUserId });
  });

  // Chat messages
  socket.on('chat-message', ({ roomId, message, userId, userName }) => {
    io.to(roomId).emit('chat-message', {
      id: uuidv4(),
      message,
      userId,
      userName,
      timestamp: new Date().toISOString()
    });
  });

  // Whiteboard
  socket.on('whiteboard-draw', ({ roomId, data }) => {
    socket.to(roomId).emit('whiteboard-draw', data);
  });

  socket.on('whiteboard-clear', ({ roomId }) => {
    socket.to(roomId).emit('whiteboard-clear');
  });

  // User status
  socket.on('toggle-video', ({ roomId, userId, enabled }) => {
    socket.to(roomId).emit('user-video-toggled', { userId, enabled });
  });

  socket.on('toggle-audio', ({ roomId, userId, enabled }) => {
    socket.to(roomId).emit('user-audio-toggled', { userId, enabled });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const { roomId } = user;
      const room = rooms.get(roomId);
      if (room) {
        room.participants = room.participants.filter(p => p.id !== user.id);
        socket.to(roomId).emit('user-left', user);
        
        // Clean up empty rooms
        if (room.participants.length === 0) {
          rooms.delete(roomId);
        }
      }
      users.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
