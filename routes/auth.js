import express from 'express';
import {
  auth_login_get,
  auth_login_post,
  auth_sign_up_get,
  auth_sign_up_post,
} from '../controllers/auth.js';

const router = express.Router();

router.get('/login', auth_login_get);

router.post('/login', auth_login_post);

router.get('/sign-up', auth_sign_up_get);

router.post('/sign-up', auth_sign_up_post);

export default router;


