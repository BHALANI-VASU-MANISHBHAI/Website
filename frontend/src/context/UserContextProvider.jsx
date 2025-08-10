import axios from "axios";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { GlobalContext } from "./GlobalContext";
import { UserContext } from "./UserContext";
// import socket from "../services/sockets";
// import socket from "../../../shared/socket/socketManager.js"; // Adjust the import path as needed
import { useEffect } from "react";
import SOCKET_EVENTS from "../../../shared/socket/events";
import {
  on,
  off,
  emit,
  connectSocket,
} from "../../../shared/socket/socketManager.js"; // Import socket manager functions
const UserContextProvider = ({ children }) => {
  const { backendUrl, token, navigate, setToken } = useContext(GlobalContext);
  const [userData, setUserData] = useState({});

  // Fetch user data from backend
  const getUserData = async (token) => {
    if (!token) return;

    try {
      const response = await axios.post(
        backendUrl + "/api/user/getdataofuser",
        { someKey: "someValue" },
        { headers: { token } }
      );

      if (response.data.success) {
        setUserData(response.data.user);
      } else {
        toast.error("Failed to load user data");
      }
    } catch (e) {
      console.log("Error in get user data", e);
      toast.error("Failed to load user data");
    }
  };

  useEffect(() => {
    console.log("User Data:", userData);
    if (userData) {
      emit(SOCKET_EVENTS.JOIN_USER_ROOM, userData._id);
      console.log("User joined their room:", userData._id);
    }
  }, [userData]);
  useEffect(() => {
    // Listen for user data updates via socket
    on(SOCKET_EVENTS.USER_PASSWORD_RESET, (data) => {
      toast.success("User changed password successfully");
      localStorage.removeItem("token");
      setToken("");
      setUserData({});
    });

    // Cleanup listener when component unmounts
    return () => {
      off(SOCKET_EVENTS.USER_PASSWORD_RESET);
    };
  }, []);

  //if not token then navigate to login
  useEffect(() => {
    if (!token) {
      console.log("No token found, redirecting to login");
      navigate("/login");
    } else {
      getUserData(token);
    }
  }, [token, navigate]);

  const value = {
    userData,
    setUserData,
    getUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
