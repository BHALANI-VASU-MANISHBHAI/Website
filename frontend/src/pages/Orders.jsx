import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { GlobalContext } from "../context/GlobalContext.jsx";
import { UserContext } from "../context/UserContext.jsx";
import socket from "../services/sockets.jsx";


const Orders = () => {
  const { backendUrl, token, currency } = useContext(GlobalContext);
  const { userData } = useContext(UserContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  console.log("User Data:", userData);
  const loadOrderData = async () => {
    try {
      if (!token) return;

      const responce = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      console.log("Order Data Response:", responce.data);
      if (responce.data.success) {
        let allOrdersItem = [];
        responce.data.orders.map((order) => {
          order.items.map((item) => {
            console.log("Order Item:", item);
            item["orderId"] = order._id;
            item["status"] = order.status;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;
            item["address"] = order.address;
            item["riderId"] = order.riderId;
            allOrdersItem.push(item);
          });
        });
        console.log("All Orders Item:", allOrdersItem);
        setOrderData(allOrdersItem);
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

  const TrackLocation = async (orderId) => {

    try {
      const  response = await axios.get(
        `${backendUrl}/api/order/${orderId}`,
        { headers: { token } }
      );
      if (response.data.success) {
        console.log("Rider location:", response.data)

        setOrderData((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? { ...order, riderId: response.data.riderId }
              : order
          )
        );

        
        // toast.success("Rider location tracked successfully");
      }
      else {
        console.error("Failed to track rider location:", response.data.message);
        toast.error("Failed to track rider location");
      }
    } catch (error) {
      console.error("Error tracking location:", error);
      toast.error("Error tracking location");
    }
  }



  useEffect(() => {
    if (!token) return;
    loadOrderData();
  }, [token]);

  useEffect(() => {
    // socket.emit("joinUserRoom", userData._id);

    socket.on("order:status:update", (data) => {
      
      setOrderData((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === data.orderId ? { ...order, status: data.status } : order
        )
      );
      
      // loadOrderData();
    });

    socket.on("order:cancelled", (data) => {
      toast.info("Order Cancelled");
      console.log("Order Cancelled:", data);
      loadOrderData();
    });

    socket.on("order:all:cancelled", (data) => {
      toast.info(data.message);
      loadOrderData();
    });

    return () => {
      socket.off("order:status:update");
      socket.off("order:cancelled");
      socket.off("order:all:cancelled");
    };
  }, [userData]);

  return (
    <div className="border-t pt-16 relative">
      {/* Fullscreen loading overlay */}

      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orderData.map(
          (item, index) => (
            console.log("Order Item:", item),
            (
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
                      <span className="text-gray-700">
                        {" "}
                        {item.paymentMethod}
                      </span>
                    </p>
                  </div>

                  <div className="w-40 flex flex-col items-center gap-2 self-start sm:self-center">
                    <div className="text-sm md:text- flex items-center gap-2">
                      <p className="w-2 h-2 rounded-full bg-green-500"></p>
                      <p className="text-sm md:text-base">{item.status}</p>
                    </div>
                    {item.status === "Out for delivery" && item.riderId && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${item.riderId.location.lat},${item.riderId.location.lng}&destination=${item.address.latitude},${item.address.longitude}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 underline"
                        onClick={() => TrackLocation(item.orderId)}
                      >
                       Track Rider
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      CancelOrder(
                        item.orderId,
                        item.size,
                        item._id,
                        item.price,
                        item.quantity
                      )
                    }
                    className={`border py-4 px-2 text-sm font-medium rounded-sm cursor-pointer ${
                      loading ||
                      item.status === "Delivered" ||
                      item.status === "Out for Delivery" ||
                      item.status === "Shipped"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      loading ||
                      item.status === "Delivered" ||
                      item.status === "Out for Delivery" ||
                      item.status === "Shipped"
                    }
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>

      {orderData.length === 0 && (
        <div className="text-center py-10 text-gray-500">No orders found.</div>
      )}

      {/* {orderData.length > 0 && (
        <div className="text-center flex justify-end items-center text-sm md:text-[16px]">
          <button
            className={`bg-red-500 text-white px-4 py-2 rounded-md mt-4 cursor-pointer hover:bg-red-700 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={CancelAllOrders}
            disabled={loading}
          >
            Cancel All Orders
          </button>
        </div>
      )} */}
    </div>
  );
};

export default Orders;
