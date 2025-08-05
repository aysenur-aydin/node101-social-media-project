import User from '../models/user.js';

export const auth_login_get = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

export const auth_login_post = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send('User not found');
    }

    if (user.password !== password) {
      return res.status(401).send('Password is wrong');
    }

    // Login success
    req.session.userId = user._id;
    req.session.username = user.username;

    res.status(200).redirect('/feed');
  } catch (err) {
    console.log(err);

    res.status(500).send('Something went wrong');
  }
};

export const auth_sign_up_get = (req, res) => {
  res.render('auth/sign-up', { title: 'Sign up' });
};

export const auth_sign_up_post = (req, res) => {
  const user = new User(req.body);

  user
    .save()
    .then((result) => {
      res.redirect('/');
    })
    .catch((err) => {
      console.log(err);
    });
};

export const auth_logout_get = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).send('Could not log out');
    }
    // Clear the session cookie (default express cookie name is 'connect.sid')
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
};
