export const handleUserSockets = (socket) => {
  socket.on('joinUserRoom', (userId) => {
    console.log(`User ${userId} joined their room`);
    socket.join(userId);
  });
};
