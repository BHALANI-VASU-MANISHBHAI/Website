import React, { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import axios from "axios";
import { GlobalContext } from "../context/GlobalContext.jsx";
import socket from "../services/sockets.jsx";
import { UserContext } from "../context/UserContext.jsx";
import { toast } from "react-toastify";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(GlobalContext);
  const { userData } = useContext(UserContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrderData = async () => {
    try {
      if (!token) return;

      const responce = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );

      if (responce.data.success) {
        let allOrdersItem = [];
        responce.data.orders.map((order) => {
          order.items.map((item) => {
            item["orderId"] = order._id;
            item["status"] = order.status;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;
            allOrdersItem.push(item);
          });
        });

        setOrderData(allOrdersItem.reverse());
      }
    } catch (err) {
      console.error("Error loading order data:", err);
      setOrderData([]);
    }
  };

  const CancelOrder = async (orderId, size, itemId, price, quantity) => {
    try {
      console.log("Cancelling order:", orderId, size, itemId, price, quantity);
      setLoading(true);
      const response = await axios.post(
        backendUrl + "/api/order/cancel",
        { orderId, size, itemId, price, quantity },
        { headers: { token } }
      );

      if (response.data.success) {
        console.log("Order cancelled successfully");
        loadOrderData();
      } else {
        console.error("Failed to cancel order:", response.data.message);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setLoading(false);
    }
  };

  const CancelAllOrders = async () => {
    try {
  
      setLoading(true);
      const response = await axios.post(
        backendUrl + "/api/order/cancelAll",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        console.log("All orders cancelled successfully");
        toast.success("All orders cancelled successfully");
        loadOrderData();
      } else {
        console.error("Failed to cancel all orders:", response.data.message);
        toast.error("Failed to cancel all orders");
      }
    } catch (error) {
      console.error("Error cancelling all orders:", error);
      toast.error("Error cancelling all orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadOrderData();
  }, [token]);

  useEffect(() => {
    socket.emit("joinUserRoom", userData._id);

    socket.on("orderStatusUpdated", () => {
      loadOrderData();
    });

    socket.on("orderCancelled", (data) => {
      toast.info("Order Cancelled");
      console.log("Order Cancelled:", data);
      loadOrderData();
    });

    socket.on("AllOrderCancelled", (data) => {
      toast.info(data.message);
      loadOrderData();
    });

    return () => {
      socket.off("orderStatusUpdated");
      socket.off("orderCancelled");
      socket.off("AllOrderCancelled");
    };
  }, [userData]);

  return (
    <div className="border-t pt-16 relative">
      {/* Fullscreen loading overlay */}


      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orderData.map((item, index) => (
          <div
            key={index}
            className="py-4 border-t border-b text-black flex flex-col gap-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-sm">
              <img className="w-16 sm:w-20" src={item.image[0]} alt="" />

              <div className="flex-1">
                <p className="sm:text-base font-medium">{item.name}</p>
                <div className="flex items-center gap-3 mt-2 text-base text-gray-700">
                  <p className="text-lg">
                    {currency} {item.price}
                  </p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(item.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(item.date).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Payment :{" "}
                  <span className="text-gray-700"> {item.paymentMethod}</span>
                </p>
              </div>

              <div className="w-40 flex items-center gap-2 self-start sm:self-center">
                <p className="w-2 h-2 rounded-full bg-green-500"></p>
                <p className="text-sm md:text-base">{item.status}</p>
              </div>

              <button
                onClick={() =>
                  CancelOrder(item.orderId, item.size, item._id, item.price, item.quantity)
                }
                className={`border py-4 px-2 text-sm font-medium rounded-sm cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                Cancel Order
              </button>
            </div>
          </div>
        ))}
      </div>

      {orderData.length === 0 && (
        <div className="text-center py-10 text-gray-500">No orders found.</div>
      )}

      {orderData.length > 0 && (
        <div className="text-center flex justify-end items-center text-sm md:text-[16px]">
          <button
            className={`bg-red-500 text-white px-4 py-2 rounded-md mt-4 cursor-pointer hover:bg-red-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={CancelAllOrders}
            disabled={loading}
          >
            Cancel All Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
