import express from 'express';
import { user_friends_get } from '../controllers/chat.js';

const router = express.Router();

router.get('/', user_friends_get);

export default router;
