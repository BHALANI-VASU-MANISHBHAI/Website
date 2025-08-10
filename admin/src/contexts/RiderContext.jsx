import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify"; // ✅ Make sure you're using toast properly
// import socket from "../services/socket"; // ✅ Import your socket service
import SOCKET_EVENTS from "../../../shared/socket/events.js";
import { on, off } from "../../../shared/socket/socketManager.js"; // Import socket manager functions
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

    on(SOCKET_EVENTS.ORDER_PACKED, async (data) => {
      console.log("Order packed event received:", data);
      // You can handle the order packed event here, e.g., show a notification
      // Optionally, you can call AssignOrderToRider here if needed
      await AssignOrderToRider(data.orderId);
    });

    on(SOCKET_EVENTS.ORDER_RIDER_ACCEPT, async (data) => {
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

    on(SOCKET_EVENTS.ORDER_STATUS_UPDATE, async (data) => {
      console.log("Order status updated event received:", data);

      if (data.status !== "Packing") {
        // Handle the order status update event here, e.g., update the riderOrders state
        await getAllRidersOrders(); // Refresh the orders
      }
    });
    on(SOCKET_EVENTS.COD_SUBMITTED, async (data) => {
      console.log("COD submitted event received:", data);
      // Handle the COD submitted event here, e.g., update the riderOrders state
      await getAllRidersOrders(); // Refresh the orders
      toast.success(`COD payment verified for order ${data.orderId}`);
    });
    on(SOCKET_EVENTS.RIDER_PROFILE_UPDATED, async (data) => {
      // Optionally, you can fetch
      await getAllRidersOrders(); // Refresh the orders
    });

    return () => {
      off(SOCKET_EVENTS.ORDER_PACKED); // Clean up the event listener
      off("ORDER_STATUS_UPDATE"); // Clean up the event listener
      off(SOCKET_EVENTS.COD_SUBMITTED);
      off(SOCKET_EVENTS.RIDER_PROFILE_UPDATED); 
      // off("orderStatusUpdated"); // Clean up the event listener
      off(SOCKET_EVENTS.ORDER_STATUS_UPDATE); // Clean up the event listener
      off(SOCKET_EVENTS.ORDER_ACCEPTED); // Clean up the event listener
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
