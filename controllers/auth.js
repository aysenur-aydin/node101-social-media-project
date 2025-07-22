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
