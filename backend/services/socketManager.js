// socketManager.js
export default function socketManager(io) {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // ---- Admin ----
    socket.on("joinAdminRoom", () => {
      console.log("Admin joined adminRoom:", socket.id);
      socket.join("adminRoom");
    });
    socket.on("leaveAdminRoom", () => {
      console.log("Admin left adminRoom:", socket.id);
      socket.leave("adminRoom");
    });

    // ---- User ----
    socket.on("joinUserRoom", (userId) => {
      console.log("User joined userRoom:", userId);
      socket.join(userId);
    });
    socket.on("joinProductRoom", ({ productId }) =>
      socket.join(productId.toString())
    );
    socket.on("leaveProductRoom", ({ productId }) =>
      socket.leave(productId.toString())
    );

    // ---- Stock ----
    socket.on("joinStockRoom", () => socket.join("stockRoom"));
    socket.on("leaveStockRoom", () => socket.leave("stockRoom"));

    // ---- Rider ----
    socket.on("joinRiderRoom", () => {
      console.log("Rider joined riderRoom:", socket.id);
      socket.join("riderRoom");
    });
    socket.on("leaveRiderRoom", () => socket.leave("riderRoom"));

    socket.on("joinSingleRiderRoom", (riderId) =>
      socket.join(`riderRoom-${riderId}`)
    );
    socket.on("leaveSingleRiderRoom", (riderId) =>
      socket.leave(`riderRoom-${riderId}`)
    );

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}
