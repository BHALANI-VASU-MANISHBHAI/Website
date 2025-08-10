import { io } from "socket.io-client";
import SOCKET_EVENTS from "./events.js";

const socket = io(
  import.meta.env.VITE_BACKEND_URL || "http://localhost:10000",
  {
    autoConnect: false,
  }
);

const listeners = {};
const emitQueue = [];
socket.on("connect", () => {
  console.log("Connected to socket server:", socket.id);
  while (emitQueue.length > 0) {
    const { event, data } = emitQueue.shift();
    console.log(`Sending queued event: ${event}`, data);
    socket.emit(event, data);
  }
});
socket.on("disconnect", () => {
  console.log("Disconnected from socket server:", socket.id);
});

export function on(event, handler) {
  if (listeners[event]) socket.off(event, listeners[event]);
  listeners[event] = handler;
  socket.on(event, handler);
}

export function off(event) {
  if (listeners[event]) {
    socket.off(event, listeners[event]);
    delete listeners[event];
  }
}

export function emit(event, data) {
  console.log(`Emitting event: ${event}`, data);

  if (socket.connected) {
    console.log("Socket is connected, emitting event");
    socket.emit(event, data);
  } else {
    console.log("Socket not connected, queueing event");
    emitQueue.push({ event, data });
  }
}

export function connectSocket() {
  if (!socket.connected) {
    console.log("Connecting to socket...");
    socket.connect();
  }
}

export function disconnectSocket() {
  socket.disconnect();
}

export function connectAdminRoom() {
  if (socket.connected) {
    console.log("Already connected to socket");
    socket.emit(SOCKET_EVENTS.JOIN_ADMIN_ROOM);
    return;
  }

  console.log("Connecting to admin room...");
  socket.connect();

  socket.once("connect", () => {
    console.log("Socket connected, joining admin room...");
    socket.emit(SOCKET_EVENTS.JOIN_ADMIN_ROOM);
  });
}

export function disconnectAdminRoom() {
  if (!socket.connected) {
    console.log("Socket is not connected, cannot leave admin room");
    return;
  }
  socket.emit(SOCKET_EVENTS.LEAVE_ADMIN_ROOM);
  disconnectSocket();
}

// joining room individual rider , user means first we connect to the socket and then join the room

export default socket;
