import session from 'express-session';

import { SESSION_SECRET } from '../config.js';

export const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // false is for development (http)
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
});
