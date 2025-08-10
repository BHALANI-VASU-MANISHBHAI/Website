import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
// import socket from "../services/socket";
// import socket from "./shared/socket/socketManager.js"; // Adjust the import path as needed
import { GlobalContext } from "./GlobalContext";
import SOCKET_EVENTS from "../../../shared/socket/events.js";
import { on, off, emit } from "../../../shared/socket/socketManager.js"; // Import socket manager functions
import { connectSocket } from "../../../shared/socket/socketManager.js";
export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const { backendUrl, setToken, token, navigate } = useContext(GlobalContext);

  const getUserData = async (token) => {
    if (!token) return;

    try {
      const response = await axios.post(
        backendUrl + "/api/user/getdataofuser",
        { someKey: "someValue" },
        { headers: { token } }
      );

      if (response.data.success) {
        console.log("User data loaded successfully", response.data.user);
        setUserData(response.data.user);
      } else {
        toast.error("Failed to load user data");
      }
    } catch (e) {
      console.log("Error in get user data", e);
      // toast.error("Failed to load user data");
    }
  };

  useEffect(() => {
    if (!userData || userData.role !== "rider") return;
    
    console.log("User data is available and role is rider:", userData);

    // Join common room

    emit(SOCKET_EVENTS.JOIN_RIDER_ROOM, userData._id);

    // ✅ Immediately join the individual rider room
    emit(SOCKET_EVENTS.JOIN_SINGLE_RIDER_ROOM, userData._id);

    // Optional: Listen for confirmation

    const handleJoin = (data) => {
      console.log("✅ Server acknowledged joinRiderRoom:", data);
    };

    on(SOCKET_EVENTS.JOIN_RIDER_ROOM, handleJoin);

    return () => {
      off(SOCKET_EVENTS.JOIN_RIDER_ROOM, handleJoin);
      emit(SOCKET_EVENTS.LEAVE_SINGLE_RIDER_ROOM, userData._id);
      emit(SOCKET_EVENTS.LEAVE_RIDER_ROOM, userData._id);
    };
  }, [userData]);

  useEffect(() => {
    if (!userData || userData.role !== "rider") return;

    const handleProfileUpdate = ({ riderId, updatedFields }) => {
      if (userData._id === riderId) {
        // toast.success("Profile updated successfully!");
        setUserData((prev) => ({
          ...prev,
          ...updatedFields,
        }));
      }
    };

    on(SOCKET_EVENTS.RIDER_PROFILE_UPDATED, handleProfileUpdate);
    on(SOCKET_EVENTS.ORDER_RIDER_NOTIFICATION, (data) => {
      console.log("New order notification for rider: in context ", data.ORDER);
      setOrderData(data.ORDER);
      toast.success("New order received!");
    });

    return () => {
      off(SOCKET_EVENTS.RIDER_PROFILE_UPDATED, handleProfileUpdate);
      off(SOCKET_EVENTS.ORDER_RIDER_NOTIFICATION);
    };
  }, [userData]);
  useEffect(() => {
    const handleResetPassword = ({ userId, message }) => {
      toast.success("Password reset successfully. Please log in again.");
      setToken(null);
      setUserData(null);
      localStorage.removeItem("token");
      navigate("/login");
    };

    on(SOCKET_EVENTS.RIDER_PASSWORD_RESET, handleResetPassword);

    return () => {
      off(SOCKET_EVENTS.RIDER_PASSWORD_RESET, handleResetPassword);
    };
  }, []);

  // Fetch user data when token changes

  useEffect(() => {
    if (token) {
      getUserData(token);
      const savedOrder = localStorage.getItem("activeOrder");
      if (savedOrder) {
        setOrderData(JSON.parse(savedOrder));
      }
    }
  }, [token]);

  // useEffect(() => {
  //   on(SOCKET_EVENTS.ORDER_RIDER_NOTIFICATION, ({ ORDER }) => {
  //     setOrderData(ORDER);
  //     localStorage.setItem("activeOrder", JSON.stringify(ORDER));
  //     toast.success("New order received!");
  //   });
  //   return () => {
  //     off(SOCKET_EVENTS.ORDER_RIDER_NOTIFICATION);
  //   };
  // }, []);

  const value = {
    userData,
    setUserData,
    getUserData,
    orderData,
    setOrderData,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
