export default function riderHandler(io, to, { data }, action) {
  console.log(`Rider action: ${action} for rider: ${to}`, data);
  if (to) {
    io.to(to).emit(action, data); // ✅ send whole data object
  } else {
    io.emit(action, data); // Emit to all if no specific room is specified
    console.log(`No specific room, emitting to all: ${action}`, data);
  }
}