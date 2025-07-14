// reviewHandler.js
export default function reviewHandler(io, to, { data }, action) {
  console.log(`Review action: ${action} for product: ${to}`, data);
  io.to(to).emit(action, data); // ✅ send whole data object
}
