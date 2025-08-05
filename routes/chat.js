import express from 'express';
import { user_friends_get, friend_chat_history_get } from '../controllers/chat.js';

const router = express.Router();

router.get('/', user_friends_get);
router.get('/messages', friend_chat_history_get);

export default router;
