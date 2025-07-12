// src/context/OrderContext.jsx
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { backendUrl } from "../App";
import socket from "../services/socket";
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
    socket.on("orderCancelled", (data) => {
      console.log("Order cancelled:", data);
      // Remove the cancelled order from the list
      setOrders((prevOrders) => prevOrders.map((order) => order._id !== data.orderId));
      // Optionally, you can also fetch all orders again
    });

    socket.on("orderPlaced", () => {
      fetchAllOrders();
    });

    socket.on("AllOrderCancelled", () => {
      fetchAllOrders();
    });

    socket.on("orderDelivered", (data) => {
      console.log("Order delivered: From OrderContect ", data);
      fetchAllOrders();
    });

    socket.on("orderStatusUpdated", (data) => {
      console.log("Order status updated:", data);
      fetchAllOrders();
    });
    return () => {
      socket.off("orderCancelled");
      socket.off("orderPlaced");
      socket.off("AllOrderCancelled");
      socket.off("orderStatusUpdated");
    };
  }, []);

  const value = {
    orders,
    setOrders,
    fetchAllOrders,
  }

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContextProvider;
