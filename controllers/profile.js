import User from '../models/user.js';

export const profile_get = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);

    res.render('profile', { title: 'Profile', user });
  } catch (err) {
    console.log(err);

    res.status(500).send('Something went wrong');
  }
};
