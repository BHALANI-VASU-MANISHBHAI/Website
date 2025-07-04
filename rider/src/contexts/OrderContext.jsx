import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { GlobalContext } from "./GlobalContext";
import socket from "../services/socket";

export const OrderContext = React.createContext();

const OrderContextProvider = ({ children }) => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const { token, backendUrl } = useContext(GlobalContext);

  const getCurrentOrder = async () => {
    try {
      console.log("backendUrl:", backendUrl);
      const response = await axios.get(`${backendUrl}/api/rider/currentOrder`, {
        headers: {
          token,
        },
      });

      if (response.data.success) {
        const order = response.data.order;
        setCurrentOrder(order);
        console.log("🚚 Current order fetched:", order);
      } else {
        toast.error(response.data.message || "Failed to fetch current order");
      }
    } catch (error) {
      console.error("Error fetching current order:", error);
      toast.error(
        error.response?.data?.message || "Error fetching current order"
      );
    }
  };

  const getRiderAcceptedOrders = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/rider/acceptedOrder`, {
        headers: { token },
      });

      if (response.data.success) {
        setOrderHistory(response.data.orders);
        console.log("Order history fetched:", response.data.orders);
        console.log("Rider's accepted orders:", response.data.orders);
      } else {
        toast.error(
          response.data.message || "Failed to fetch rider's accepted orders"
        );
      }
    } catch (error) {
      console.error("Error fetching rider's accepted orders:", error);
      toast.error(
        error.response?.data?.message ||
          "Error fetching rider's accepted orders"
      );
    }
  };

  useEffect(() => {
    if (!token) return;

    if (!currentOrder) getCurrentOrder();
    if (orderHistory.length === 0) getRiderAcceptedOrders();
  }, [token]);

  const value = {
    orderHistory,
    setOrderHistory,
    currentOrder,
    setCurrentOrder,
    paymentHistory,
    setPaymentHistory,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContextProvider;
