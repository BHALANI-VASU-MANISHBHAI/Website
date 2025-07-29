export default function stockHandler(io, to, { data }, action) {
  
  if (to) {
    io.to(to).emit(action, data);
  } else {
    io.emit(action, data);
  }
}
