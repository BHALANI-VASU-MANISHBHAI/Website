import axios from "axios";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { GlobalContext } from "./GlobalContext";
import { UserContext } from "./UserContext";
import socket from "../services/sockets";
import { useEffect } from "react";
import { use } from "react";

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
      socket.emit("joinUserRoom", userData._id);
      console.log("User joined their room:", userData._id);
    }
  }, [userData]);
  useEffect(() => {
    // Listen for user data updates via socket
    socket.on("user:password:reset", (data) => {
      toast.success("User changed password successfully");
      localStorage.removeItem("token");
      setToken("");
      setUserData({});
    });

    // Cleanup listener when component unmounts
    return () => {
      socket.off("user:password:reset");
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
