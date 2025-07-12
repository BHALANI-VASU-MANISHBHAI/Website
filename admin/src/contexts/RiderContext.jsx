import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify"; // ✅ Make sure you're using toast properly
import socket from "../services/socket"; // ✅ Import your socket service
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const RiderContext = createContext();

const RiderContextProvider = ({ children }) => {
  const [riders, setRiders] = useState([]);
  const [riderOrders, setRiderOrders] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [onlineRiders, setOnlineRiders] = useState([]);

  const getAllRidersOrders = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/rider/AllriderOrders`,
        {
          headers: {
            token,
          },
        }
      );

      if (response.data.success) {
        console.log("Riders orders:", response.data.orders);
        setRiderOrders(response.data.orders);
      } else {
        // toast.error(response.data.message || "Failed to fetch riders orders");
      }
    } catch (err) {
      console.error("Error fetching rider orders:", err);
      toast.error(
        err?.response?.data?.message || "Failed to fetch riders orders"
      );
    }
  };
  const fetchOnlineRiders = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/rider/online-riderCount`,
        {
          headers: { token },
        }
      );
      console.log("Online Riders Response:", response.data);
      if (response.data.success) {
        setOnlineRiders(response.data.onlineRiders);
      }
    } catch (error) {
      console.error("Error fetching online riders:", error);
      toast.error(response?.data?.message || "Failed to fetch online riders");
    }
  };

  //call to backend to get all riders
  const AssignOrderToRider = async (orderId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/rider/assign`,
        {
          orderId,
          pickupLat: 19.076,
          pickupLng: 72.8777,
          deliveryLat: 19.076,
          deliveryLng: 72.8777,
        },
        { headers: { token } }
      );
      console.log("Assign Order Response:", response.data);
      if (response.data.success) {
        console.log("Order assigned to rider:", response.data);
      } else {
        toast.error(response.data.message || "Failed to assign order to rider");
      }
    } catch (err) {
      console.error("Error assigning order to rider:", err);
      toast.error(
        err?.response?.data?.message || "Failed to assign order to rider"
      );
    }
  };



  useEffect(() => {
    //    req.app.get("io").to("adminRoom").emit("orderPacked", {
    // orderId: updatedOrder._id,
    // status: "Packing",
    // message: "Order is ready to assign a rider",
    //    });

    socket.on("orderPacked", async (data) => {
      console.log("Order packed event received:", data);
      // You can handle the order packed event here, e.g., show a notification
      toast.info(`Order ${data.orderId} is ready to assign a rider`);
      // Optionally, you can call AssignOrderToRider here if needed
      await AssignOrderToRider(data.orderId);
    });

    socket.on("acceptedOrder", async (data) => {
      console.log("Order accepted event received:", data);

      // Optimistically update order in context
      setRiderOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === data.order._id ? data.order : order
        )
      );

      // Optionally refetch to ensure accuracy
      await getAllRidersOrders();

      toast.success(`Order ${data.order._id} accepted by rider`);
    });
    

    socket.on("orderStatusUpdated", async (data) => {
      console.log("Order status updated event received:", data);
      if (data.status !== "Packing") {
      // Handle the order status update event here, e.g., update the riderOrders state
      toast.info(`Order ${data.orderId} status updated to ${data.status}`);
      await getAllRidersOrders(); // Refresh the orders
    }
    });
    socket.on("codSubmitted", async (data) => {
      console.log("COD submitted event received:", data);
      // Handle the COD submitted event here, e.g., update the riderOrders state
      await getAllRidersOrders(); // Refresh the orders
      toast.success(`COD payment verified for order ${data.orderId}`);
    });
    socket.on("riderProfileUpdated", async(data) => {
     await getAllRidersOrders(); // Refresh the orders
    });

    return () => {
      socket.off("orderPacked"); // Clean up the event listener
      socket.off("acceptedOrder"); // Clean up the event listener
      socket.off("codSubmitted"); // Clean up the event listener
      socket.off("riderProfileUpdated"); // Clean up the event listener
      socket.off("orderStatusUpdated"); // Clean up the event listener
    };
  }, [token]);

  useEffect(() => {
    if (token) {
      getAllRidersOrders();
      fetchOnlineRiders();
    }
  }, [token]);

  const value = {
    riders,
    setRiders,
    riderOrders,
    getAllRidersOrders,
    onlineRiders,
  };

  return (
    <RiderContext.Provider value={value}>{children}</RiderContext.Provider>
  );
};

export default RiderContextProvider;
