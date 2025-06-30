// src/services/socket.js
import { io } from "socket.io-client";

// Create a single, persistent socket connection
const socket = io(
  import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
  {
    autoConnect: true,
    reconnection: true, // Enable reconnection (default is true)
    reconnectionAttempts: Infinity, // Keep trying
    reconnectionDelay: 1000, // Wait 1s between attempts
  }
);

// Optional: Add a global reconnect listener
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);

  // Always re-join admin room on connect/reconnect
  socket.emit('joinAdminRoom');
});

export default socket;
