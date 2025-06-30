import { handleAdminSockets } from './adminSocketHandler.js';
import { handleProductSockets } from './productSocketHandler.js';
import { handleRiderSockets } from './riderSocketHandler.js';
import { handleStockSockets } from './stockSocketHandler.js';
import { handleUserSockets } from './userSocketHandler.js';

export const registerSocketHandlers = (socket, io) => {
  handleAdminSockets(socket);
  handleUserSockets(socket);
  handleProductSockets(socket, io);
  handleStockSockets(socket);
  handleRiderSockets(socket, io);
};
