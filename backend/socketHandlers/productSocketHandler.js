export const handleProductSockets = (socket, io) => {
  socket.on('joinProductRoom', ({ productId }) => {
    console.log(`User ${socket.id} joined product room ${productId}`);
    socket.join(productId.toString());
  });

  socket.on('leaveProductRoom', ({ productId }) => {
    console.log(`User ${socket.id} left product room ${productId}`);
    socket.leave(productId.toString());
  });
};
