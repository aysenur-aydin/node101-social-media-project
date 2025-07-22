import express from 'express';
import Post from '../models/post.js';

const router = express.Router();

router.get('/create', (req, res) => {
  res.render('create-post', { title: 'Create Post' });
});

router.post('/create', async (req, res) => {
  try {
    const { content, url } = req.body;
    const userId = req.session.userId;

    if (!userId) return res.redirect('/auth/login');

    const newPost = new Post({ content, url, author: userId });

    await newPost.save();

    res.redirect('/feed');
  } catch (err) {
    console.error(err);

    res.status(500).send('Internal Server Error');
  }
});

export default router;
