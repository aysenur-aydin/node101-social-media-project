import { createServer } from 'node:http';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';

import { DATABASE_URI, PORT } from './config.js';
import { sessionMiddleware } from './middlewares/session.js';
import setupSocket from './socket/socket.js';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import postRoutes from './routes/post.js';
import profileRoutes from './routes/profile.js';

import Post from './models/post.js';
import User from './models/user.js';

const app = express();
const server = createServer(app);

mongoose
  .connect(DATABASE_URI)
  .then(() => {
    // socket.io works in server, dont use app! be careful !
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log(err));

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(sessionMiddleware);

setupSocket(server, sessionMiddleware);

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
  if (!userId) {
    return res.redirect('/auth/login');
  }
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
