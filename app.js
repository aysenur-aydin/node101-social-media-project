import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import session from 'express-session';

import { createServer } from 'node:http';

import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/post.js';
import profileRoutes from './routes/profile.js';
import chatRoutes from './routes/chat.js';

import Post from './models/post.js';
import User from './models/user.js';
import Message from './models/message.js';

// for .env file
dotenv.config();

// express app
const app = express();

// http server
const server = createServer(app);

// connect to mongodb
const dbURI = process.env.MONGODB_URI;

// server port
const PORT = process.env.SERVER_PORT;

mongoose
  .connect(dbURI)
  .then(() => {
    // socket.io works in server, dont use app! be careful !
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log(err));

// register view engine
app.set('view engine', 'pug');

// middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); //  parses incoming HTML form data and makes it available under req.body
app.use(morgan('dev')); // logs HTTP requests in development-friendly format

// session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // false is for development (http)
});

app.use(sessionMiddleware);

// Socket.io setup
const io = new Server(server);

// Share session between Express and Socket.io
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  const session = socket.request.session;
  const senderUserId = session?.userId;
  const senderUsername = session?.username || 'Guest';

  console.log(
    `Socket (sockedId) ${socket.id} connected, session (userId):`,
    session?.userId,
    ' username:',
    senderUsername
  );

  onlineUsers.set(senderUserId, socket.id);

  socket.on('private_message', async ({ toUserId, message }) => {
    const newMessage = new Message({
      from: senderUserId,
      to: toUserId,
      text: message,
    });
    await newMessage.save();

    // Emit the message to the sender
    const receiverSocketId = onlineUsers.get(toUserId);
    if (receiverSocketId) {
      console.log('server receiver id is online: ', senderUserId, message);
      io.to(receiverSocketId).emit('new_private_message', {
        fromUserId: senderUserId,
        fromUsername: senderUsername,
        message: message,
        createdAt: newMessage.createdAt,
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) onlineUsers.delete(key);
    });
  });
});

// routes
app.use('/auth', authRoutes);
app.use('/post', postRoutes);
app.use('/profile', profileRoutes);
app.use('/chat', chatRoutes);

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

app.get('/feed', async (req, res) => {
  const userId = req.session.userId;
  const user = await User.findById(userId);
  const posts = await Post.find().populate('author').sort({ createdAt: -1 });
  res.render('feed', { title: 'Feed', user, posts });
});

app.get('/chat', (req, res) => {
  res.render('chat', { title: 'Chat' });
});

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});
