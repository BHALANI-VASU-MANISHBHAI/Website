// src/context/OrderContext.jsx
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { backendUrl } from "../App";
// import socket from "../services/socket";
// import socket from "../../../shared/socket/socketManager.js";
import { toast } from "react-toastify";
import SOCKET_EVENTS from "../../../shared/socket/events";
import { on, off } from "../../../shared/socket/socketManager.js";
// ✅ Create context here (this was wrong in your code)
export const OrderContext = createContext();

const OrderContextProvider = ({ children, token }) => {
  const [orders, setOrders] = useState([]);

  // Fetch all orders
  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        { k: "L" },
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // Initial fetch when token changes
  useEffect(() => {
    if (!token) return;
    fetchAllOrders();
  }, [token]);

  // Listen to socket updates
  useEffect(() => {
    // ✅ Listen for order cancellation
    on(SOCKET_EVENTS.ORDER_CANCELLED, (data) => {
      console.log("Order cancelled:", data);
      toast.error("Order cancelled successfully!");
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== data.orderId)
      );
    });

    // ✅ Listen for order placement
    on(SOCKET_EVENTS.ORDER_PLACED, (data) => {
      toast.success("Order placed successfully!");

      console.log("Order placed:", data);
      if (data && data.order) {
        const order = data.order;
        setOrders((prevOrders) => [...prevOrders, order]);
      }
    });

    // ✅ Listen for all orders cancellation
    on(SOCKET_EVENTS.ORDER_ALL_CANCELLED, (data) => {
      fetchAllOrders();
    });

    // ✅ Listen for order delivery
    on(SOCKET_EVENTS.ORDER_DELIVERED, (data) => {
      console.log("Order delivered: From OrderContect ", data);
      toast.success("Order delivered successfully!");

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === data.orderId ? { ...order, status: "Delivered" } : order
        )
      );
    });

    // ✅ Listen for order status updates
    on(SOCKET_EVENTS.ORDER_STATUS_UPDATE, (data) => {
      console.log("Order status updated:", data);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === data.orderId ? { ...order, status: data.status } : order
        )
      );
      toast.success(`Order status updated to ${data.status}`);
      // fetchAllOrders();
    });
    return () => {
      off(SOCKET_EVENTS.ORDER_CANCELLED);
      // socket.off("orderPlaced");
      off(SOCKET_EVENTS.ORDER_PLACED);
      off(SOCKET_EVENTS.ORDER_ALL_CANCELLED);
      off(SOCKET_EVENTS.ORDER_STATUS_UPDATE);
      off(SOCKET_EVENTS.ORDER_DELIVERED);
    };
  }, []);

  const value = {
    orders,
    setOrders,
    fetchAllOrders,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

export default OrderContextProvider;
