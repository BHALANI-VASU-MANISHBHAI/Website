  import React, { createContext, useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  // 1. Create context
  export const GlobalContext = createContext();

  // 2. Create provider component
  const GlobalContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [token, setToken] = useState(() =>  localStorage.getItem("token") || null);
      const [currentLocation, setCurrentLocation] = useState(null);
  
    const navigate = useNavigate();

    // 3. Load token from localStorage on mount
    useEffect(() => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) setToken(storedToken);
    }, []);


    const value = {
      backendUrl,
      token,
      setToken,
      navigate,
      currentLocation,
      setCurrentLocation,
    };

    return (
      <GlobalContext.Provider value={value}>
        {children}
      </GlobalContext.Provider>
    );
  };

  export default GlobalContextProvider;
