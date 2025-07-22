import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import session from 'express-session';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/post.js';
import profileRoutes from './routes/profile.js';

import Post from './models/post.js';
import User from './models/user.js';

// for .env file
dotenv.config();

// connect to mongodb
const dbURI = process.env.MONGODB_URI;

mongoose
  .connect(dbURI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));

// express app
const app = express();

// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); //  parses incoming HTML form data and makes it available under req.body
app.use(morgan('dev')); // logs HTTP requests in development-friendly format

// session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // for development (http)
  })
);

// routes
app.use('/auth', authRoutes);
app.use('/post', postRoutes);
app.use('/profile', profileRoutes);

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

app.get('/feed', async (req, res) => {
  const userId = req.session.userId;
  const user = await User.findById(userId);
  const posts = await Post.find().populate('author').sort({ createdAt: -1 });
  res.render('feed', { title: 'Feed', user, posts });
});

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});
