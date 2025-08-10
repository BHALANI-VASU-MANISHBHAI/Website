export default function productHandler(io, to, { data }, action) {
  console.log(
    `productHandler: Emitting action ${action} to ${to || "all"}`,
    data
  );
  if (to) {
    io.to(to).emit(action, data); // ✅ send whole data object
  } else {
    io.emit(action, data); // Emit to all if no specific room is specified
  }
}
