const Message = require("../models/message");
const User = require("../models/user"); // Add this line

// Keep track of connected users
const onlineUsers = {};

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log("User connected");

    // STEP 1: Register user to their room & mark them online
    socket.on('register-user', async (userId) => {
      socket.join(userId);
      onlineUsers[socket.id] = userId;

      // Update DB
      await User.findByIdAndUpdate(userId, { isOnline: true });

      // Broadcast to all others that this user is online
      socket.broadcast.emit('update-user-status', {
        userId,
        isOnline: true,
      });

      console.log(` ${userId} is now online`);
    });

    // STEP 2: Handle sending messages
    socket.on('send-msg', async (data) => {
      try {
        // Emit message to both sender and receiver
        io.to(data.to).emit('receive-msg', data);
        io.to(data.from).emit('receive-msg', data);
      } catch (err) {
        console.error(" Error saving message to DB:", err);
      }
    });

    // STEP 3: Disconnect = Mark user offline
    socket.on('disconnect', async () => {
      const userId = onlineUsers[socket.id];
      if (userId) {
        await User.findByIdAndUpdate(userId, { isOnline: false });
        socket.broadcast.emit('update-user-status', {
          userId,
          isOnline: false,
        });
        console.log(` ${userId} is now offline`);
        delete onlineUsers[socket.id];
      }

      console.log(" User disconnected");
    });
  });
};
