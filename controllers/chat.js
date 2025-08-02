import User from '../models/user.js';

export const user_friends_get = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);

    if (!req.session.userId) {
      return res.redirect('auth/login');
    }

    const friends = await User.find({
      _id: { $in: user.friends },
    }).select('username profileImage');

    res.render('chat', { title: 'Chat', user, friends });
  } catch (err) {
    console.log(err);

    res.status(500).send('Something went wrong');
  }
};
