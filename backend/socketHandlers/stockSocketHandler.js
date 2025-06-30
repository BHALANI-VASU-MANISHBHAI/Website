export const handleStockSockets = (socket) => {
  socket.on('joinStockRoom', () => {
    console.log('User joined stockRoom:', socket.id);
    socket.join('stockRoom');
  });

  socket.on('leaveStockRoom', () => {
    console.log('User left stockRoom:', socket.id);
    socket.leave('stockRoom');
  });
};
