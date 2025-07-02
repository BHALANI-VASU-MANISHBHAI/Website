import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import axios from "axios";
import { toast } from "react-toastify"; // ✅ Make sure you're using toast properly
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const RiderContext = createContext();

const RiderContextProvider = ({ children }) => {
  const [riders, setRiders] = useState([]);
  const [riderOrders, setRiderOrders] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [onlineRiders, setOnlineRiders] = useState([]);

  const getAllRidersOrders = async () => {
    try {

      const response = await axios.get(`${backendUrl}/api/rider/AllriderOrders`, {
        headers: {
          token
        }
      });

      if (response.data.success) {
        console.log("Riders orders:", response.data.orders);
        setRiderOrders(response.data.orders);
        toast.success(response.data.message || "Riders orders fetched successfully");
      } else {
        toast.error(response.data.message || "Failed to fetch riders orders");
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
      const response = await axios.get(`${backendUrl}/api/rider/online-riderCount`, {
        headers: { token },
      });
      console.log("Online Riders Response:", response.data);
      if (response.data.success) {
        setOnlineRiders(response.data.onlineRiders);
        toast.success("Online riders fetched successfully");
      }
    } catch (error) {
      console.error("Error fetching online riders:", error);
      toast.error(response?.data?.message || "Failed to fetch online riders");
    }
  }
  
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
    onlineRiders
  };

  return (
    <RiderContext.Provider value={value}>
      {children}
    </RiderContext.Provider>
  );
};


export default RiderContextProvider;
