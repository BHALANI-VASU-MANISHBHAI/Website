import  {  useState, useEffect } from "react";
import { GlobalContext } from "./GlobalContext";
import { useNavigate } from "react-router-dom";

const GlobalContextProvider = ({ children }) => {
  const [token, setToken] = useState("");

  const currency = "₹"; // Indian Rupee
  const delivery_fee = 100;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const value = {
    token,
    setToken,
    backendUrl,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    navigate,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export default GlobalContextProvider;