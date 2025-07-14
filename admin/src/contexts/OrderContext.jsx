// src/context/OrderContext.jsx
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { backendUrl } from "../App";
import socket from "../services/socket";
import { toast } from "react-toastify";
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
    socket.on("order:cancelled", (data) => {
      console.log("Order cancelled:", data);
      toast.error("Order cancelled successfully!");
      // Remove the cancelled order from the list
      // setOrders((prevOrders) =>
      //   prevOrders.map((order) => order._id !== data.orderId)
      // );
      fetchAllOrders();
      // Optionally, you can also fetch all orders again
    });

    socket.on("order:placed", () => {
      toast.success("Order placed successfully!wowowoowowowo");
      fetchAllOrders();
    });

    socket.on("order:all:cancelled", () => {
      fetchAllOrders();
    });

    socket.on("order:delivered", (data) => {
      console.log("Order delivered: From OrderContect ", data);
      fetchAllOrders();
    });

    socket.on("order:status:update", (data) => {
      console.log("Order status updated:", data);
      toast.info("Orader status must be updated");
      fetchAllOrders();
    });
    return () => {
      socket.off("order:cancelled");
      // socket.off("orderPlaced");
      socket.off("order:placed");
      socket.off("order:all:cancelled");
      socket.off("order:status:update");
      socket.off("order:delivered");
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
