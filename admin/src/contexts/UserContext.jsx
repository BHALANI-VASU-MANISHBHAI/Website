import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { GlobalContext } from "./GlobalContext"; // Import GlobalContext

export const UserContext = React.createContext();

const UserContextProvider = ({ children }) => {
  const { token, setToken, backendUrl } = useContext(GlobalContext); // Access GlobalContext
  const [userData, setUserData] = useState(null);

  // const fetchUserData = async () => {
  //   try {
  //     if (!token) return; // If token doesn't exist, skip

  //     const response = await axios.post(
  //       backendUrl + "/api/user/getuser",
  //       {},
  //       { headers: { token } }
  //     );

  //     if (response.data.success) {
  //       setUserData(response.data.user);
  //       console.log("User data fetched successfully", response.data.user);
  //     } else {
  //       setUserData(null);
  //       console.log("Failed to fetch user data");
  //     }
  //   } catch (error) {
  //     console.log("Error fetching user data", error);
  //   }
  // };

  // useEffect(() => {
  //   if (token) {
  //     fetchUserData();
  //   }
  // }, [token]);

  const values = {
    userData,
    // fetchUserData,
  };

  return (
    <UserContext.Provider value={values}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
