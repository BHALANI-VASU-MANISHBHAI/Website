import React, {  useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useContext } from "react";
import { GlobalContext } from "./GlobalContext";
import { UserContext } from "./UserContext";


const UserContextProvider = ({ children }) => {

    const { backendUrl, token } = useContext(GlobalContext);
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

  React.useEffect(() => {
    if (token) {
      getUserData(token);
    }
  }, [token]);

  const value = {
    userData,
    setUserData,
    getUserData,
  };

  return (
    <UserContext.Provider value={value}>
        {children}
    </UserContext.Provider>
    );
}

export default UserContextProvider; 