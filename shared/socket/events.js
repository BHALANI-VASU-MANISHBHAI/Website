// shared/socket/SOCKET_EVENTS.js
const SOCKET_EVENTS = {
  /* ---------------------------- ORDER EVENTS ---------------------------- */
  ORDER_PLACED:"order:placed",
  ORDER_CANCELLED: "order:cancelled",
  ORDER_ALL_CANCELLED: "order:all:cancelled",
  ORDER_DELIVERED: "order:delivered",
  ORDER_STATUS_UPDATE: "order:status:update",
  ORDER_PACKED: "order:packed",
  ORDER_ACCEPTED: "order:accepted",
  ORDER_RIDER_ACCEPT: "order:rider:accept",
  ORDER_RIDER_NOTIFICATION: "order:rider:notification",

  /* --------------------------- PRODUCT EVENTS --------------------------- */
  PRODUCT_ADDED: "product:added",
  PRODUCT_UPDATED: "product:updated",
  PRODUCT_DELETED: "product:deleted",
  PRODUCT_LOW_STOCK_UPDATED: "product:lowstock:updated",
  PRODUCT_OUT_OF_STOCK_UPDATED: "product:outofstock:updated",
  PRODUCT_BESTSELLER_UPDATED: "product:bestseller:updated",

  /* ----------------------------- STOCK EVENTS --------------------------- */
  STOCK_UPDATED: "stock:updated",

  /* ----------------------------- REVIEW EVENTS -------------------------- */
  REVIEW_ADDED: "review:add",
  REVIEW_UPDATED: "review:update",
  REVIEW_DELETED: "review:delete",

  /* ----------------------------- CUSTOMER EVENTS ------------------------ */
  CUSTOMER_ADDED: "customer:added",

  /* ------------------------------ COD EVENTS ---------------------------- */
  COD_SUBMITTED: "codSubmitted",

  /* ------------------------------ ADMIN EVENTS -------------------------- */
  JOIN_ADMIN_ROOM: "joinAdminRoom",
  LEAVE_ADMIN_ROOM: "leaveAdminRoom",

  /* ------------------------------- USER EVENTS -------------------------- */
  JOIN_USER_ROOM: "joinUserRoom",
  JOIN_PRODUCT_ROOM: "joinProductRoom",
  LEAVE_PRODUCT_ROOM: "leaveProductRoom",
  USER_PASSWORD_RESET: "user:password:reset",

  /* ------------------------------ STOCK ROOMS --------------------------- */
  JOIN_STOCK_ROOM: "joinStockRoom",
  LEAVE_STOCK_ROOM: "leaveStockRoom",

  /* ------------------------------ RIDER EVENTS -------------------------- */
  JOIN_RIDER_ROOM: "joinRiderRoom",
  LEAVE_RIDER_ROOM: "leaveRiderRoom",
  JOIN_SINGLE_RIDER_ROOM: "joinSingleRiderRoom",
  LEAVE_SINGLE_RIDER_ROOM: "leaveSingleRiderRoom",
  RIDER_PASSWORD_RESET: "rider:password:reset",
  RIDER_PROFILE_UPDATED: "rider:profile:updated",
};

export default SOCKET_EVENTS;
