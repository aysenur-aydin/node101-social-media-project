import { Server } from 'socket.io';

import Message from '../models/message.js';

import { PRIVATE_MESSAGE, NEW_PRIVATE_MESSAGE } from '../public/shared/socketLib.js';

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

    socket.on(PRIVATE_MESSAGE, async ({ toUserId, message }) => {
      const newMessage = new Message({
        from: senderUserId,
        to: toUserId,
        text: message,
      });
      await newMessage.save();

      const receiverSocketId = onlineUsers.get(toUserId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit(NEW_PRIVATE_MESSAGE, {
          fromUserId: senderUserId,
          fromUsername: senderUsername,
          isMine: false,
          message: message,
          createdAt: newMessage.createdAt,
        });
      }

      // Emit the message to the sender
      socket.emit(NEW_PRIVATE_MESSAGE, {
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
