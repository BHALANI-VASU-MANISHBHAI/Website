// src/context/OrderContext.jsx
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import socket from "../services/socket";
import { backendUrl } from "../App";
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
    socket.on("orderCancelled", () => {
      fetchAllOrders();
    });

    socket.on("orderPlaced", () => {
      fetchAllOrders();
    });

    socket.on("AllOrderCancelled", () => {
      fetchAllOrders();
    });

    return () => {
      socket.off("orderCancelled");
      socket.off("orderPlaced");
      socket.off("AllOrderCancelled");
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
