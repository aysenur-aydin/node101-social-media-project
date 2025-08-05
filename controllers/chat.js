import User from '../models/user.js';
import Message from '../models/message.js';

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

export const friend_chat_history_get = async (req, res) => {
  const friendId = req.query.friendId;
  const userId = req.session.userId;

  if (!friendId) {
    return res.status(400).json({ error: 'Friend ID is required' });
  }

  try {
    const messages = await Message.find({
      $or: [
        { from: userId, to: friendId },
        { from: friendId, to: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('from', 'username profileImage')
      .populate('to', 'username profileImage');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
