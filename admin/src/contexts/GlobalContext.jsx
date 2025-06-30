import React, { createContext, useState, useEffect } from 'react';

export const GlobalContext = React.createContext();

const GlobalContextProvider = ({ children }) => {
  const [searchbar, setSearchbar] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !token) {
      setToken(storedToken);
    } else if (!storedToken) {
      setToken(null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token'); // Clean up localStorage when token is null
    }
  }, [token]);

  const values = {
    searchbar,
    setSearchbar,
    token,
    setToken,       // ✅ Export this to allow login/logout token updates
    backendUrl,
  };

  return (
    <GlobalContext.Provider value={values}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
