// reviewHandler.js
export default function orderHandler(io, to, { data }, action) {
    
    if (to)
        io.to(to).emit(action, data); // ✅ send whole data object
    else {
       io.emit(action, data); // Emit to all if no specific room is specified
       
    }
}
