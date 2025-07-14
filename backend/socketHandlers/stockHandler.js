export default function stockHandler(io, to, { data }, action) {
  console.log(`Stock action: ${action} for product: ${to}`, data);
  if (to) {
    io.to(to).emit(action, data);
  } else {
    io.emit(action, data);
    console.log(`No specific room, emitting to all: ${action}`, data);
  }
}