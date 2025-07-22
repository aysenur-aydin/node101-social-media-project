import express from 'express';
import {
  profile_get,
} from '../controllers/profile.js';

const router = express.Router();

router.get('/', profile_get);


export default router;
