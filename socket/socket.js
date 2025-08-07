import { Server } from 'socket.io';

import Message from '../models/message.js';

const onlineUsers = new Map();

export default function initializeSocket(server, sessionMiddleware) {
  const io = new Server(server);

  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on('connection', (socket) => {
    const session = socket.request.session;
    const senderUserId = session?.userId;
    const senderUsername = session?.username || 'Guest';

    console.log(
      `Socket (sockedId) ${socket.id} connected, session (userId):`,
      session?.userId,
      ' username:',
      senderUsername
    );

    onlineUsers.set(senderUserId, socket.id);

    socket.on('private_message', async ({ toUserId, message }) => {
      const newMessage = new Message({
        from: senderUserId,
        to: toUserId,
        text: message,
      });
      await newMessage.save();

      // Emit the message to the sender
      const receiverSocketId = onlineUsers.get(toUserId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_private_message', {
          fromUserId: senderUserId,
          fromUsername: senderUsername,
          isMine: false,
          message: message,
          createdAt: newMessage.createdAt,
        });
      }

      // Emit the message to the sender
      socket.emit('new_private_message', {
        fromUserId: senderUserId,
        fromUsername: senderUsername,
        isMine: true,
        message: message,
        createdAt: newMessage.createdAt,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      onlineUsers.forEach((value, key) => {
        if (value === socket.id) onlineUsers.delete(key);
      });
    });
  });
}
