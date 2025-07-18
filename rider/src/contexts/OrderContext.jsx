import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import socket from "../services/socket";
import { GlobalContext } from "./GlobalContext";

export const OrderContext = React.createContext();

const OrderContextProvider = ({ children }) => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const { token, backendUrl } = useContext(GlobalContext);

  const getCurrentOrder = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/rider/currentOrder`, {
        headers: {
          token,
        },
      });

      if (response.data.success) {
        const order = response.data.order;
        console.log("Current OrderCOtecec :", order);
        setCurrentOrder(order);
      } else {
        toast.error(response.data.message || "Failed to fetch current order");
      }
    } catch (error) {
      // console.error("Error fetching current order:", error);
      // toast.error(
      //   error.response?.data?.message || "Error fetching current order"
      // );
    }
  };

  const getRiderAcceptedOrders = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/rider/acceptedOrder`,
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        setOrderHistory(response.data.orders);
      } else {
        // toast.error(
        //   response.data.message || "Failed to fetch rider's accepted orders"
        // );
      }
    } catch (error) {
      console.error("Error fetching rider's accepted orders:", error);
      // toast.error(
      //   error.response?.data?.message ||
      //     "Error fetching rider's accepted orders"
      // );
    }
  };
  const fetchUserPaymentHistory = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/rider/riderCODHistory`, {
        headers: { token },
      });
      console.log("Payment History Response:", res.data);
      if (res.data.success) {
        setPaymentHistory(res.data.RiderOrders);
      } else {
        // toast.error("Failed to fetch payment history");
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
      // toast.error(
      //   err.response?.data?.message || "Failed to fetch payment history"
      // );
    }
  };
  useEffect(() => {
    socket.on("order:delivered", (data) => {
      toast.success("Order accepted successfully");

      orderHistory.push(data.order);
      // setOrderHistory([...orderHistory]);
      toast.success("COD collected successfully");
      console.log("COD collected:", data);
      setPaymentHistory((prev) => [...prev, data.order]);
      setOrderHistory((prev) => [...prev, data.order]);
      setCurrentOrder(null);
    });
    socket.on("order:rider:accept", (data) => {
      toast.success("Order accepted successfully");
      setCurrentOrder(data.order);
    });

    return () => {
      socket.off("order:delivered");
      socket.off("order:rider:accept");
    };
  }, [token]);


  useEffect(() => {
    if (token) {
      getRiderAcceptedOrders();
      fetchUserPaymentHistory();
      getCurrentOrder();
    }
  }, [token]);

  

  const value = {
    orderHistory,
    setOrderHistory,
    currentOrder,
    setCurrentOrder,
    paymentHistory,
    setPaymentHistory,
    fetchUserPaymentHistory,
    getCurrentOrder,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

export default OrderContextProvider;
