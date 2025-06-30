export const handleAdminSockets = (socket) => {
  socket.on('joinAdminRoom', () => {
    console.log('Admin joined adminRoom:', socket.id);
    socket.join('adminRoom');
  });
};
