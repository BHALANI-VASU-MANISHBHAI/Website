import axios from "axios";
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from "react-toastify";
import socket from '../services/socket';
import { GlobalContext } from './GlobalContext';

export const UserContext = createContext();



const UserContextProvider = ({ children }) => {

    const [userData , setUserData] = useState(null);
    const [orderData, setOrderData] = useState(null);
    const {backendUrl,setToken,token} = useContext(GlobalContext);

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
  if (!userData || userData.role !== 'rider') return;

  console.log("User data is available and role is rider:", userData);

  // Join common room
  socket.emit("joinRiderRoom", userData._id);

  // ✅ Immediately join the individual rider room
  socket.emit("joinSingleRiderRoom", userData._id);

  // Optional: Listen for confirmation  

  const handleJoin = (data) => {
    console.log("✅ Server acknowledged joinRiderRoom:", data);
  };


  socket.on("joinRiderRoom", handleJoin);

  return () => {
    socket.off("joinRiderRoom", handleJoin);
    socket.emit("leaveSingleRiderRoom", userData._id);
    socket.emit("leaveRiderRoom", userData._id);
  };
}, [userData]);



useEffect(() => {
  if (!userData || userData.role !== "rider") return;

  const handleProfileUpdate = ({ riderId, updatedFields }) => {
    if (userData._id === riderId) {
      console.log("🔄 Updating user profile in context:", updatedFields);
      toast.success("Profile updated succssssssessfully!");
      setUserData((prev) => ({
        ...prev,
        ...updatedFields
      }));
    }
  };

  socket.on("rider:profile:updated", handleProfileUpdate);

  return () => {
    socket.off("rider:profile:updated", handleProfileUpdate);
  };
}, [userData]);




    // Fetch user data when token changes

useEffect(() => {
        if (token) {
            getUserData(token);
        }
    }, [token]);
    const value = {
        userData,
        setUserData,
        getUserData,
        orderData
    };
    return (
        
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export default UserContextProvider;