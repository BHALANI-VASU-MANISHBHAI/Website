// reviewHandler.js
export default function orderHandler(io, to, { data }, action) {
    console.log(`Review action: ${action} for product: ${to}`, data);
    if (to)
        io.to(to).emit(action, data); // ✅ send whole data object
    else {
       io.emit(action, data); // Emit to all if no specific room is specified
       console.log(`No specific room, emitting to all: ${action}`, data);
    }
}
