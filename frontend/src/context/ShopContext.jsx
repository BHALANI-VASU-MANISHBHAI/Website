import { createContext, useState, useEffect } from "react";
import cloneDeep from "lodash-es/cloneDeep";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { GlobalContext } from "./GlobalContext";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const { delivery_fee } = useContext(GlobalContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [userData, setUserData] = useState({});
  const [AllSubscribers, setSubscriberData] = useState([]);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const [Subscriber, setSubscriber] = useState(false);

  const navigate = useNavigate();
//<-------------------------------------------------- Functions --------------------------------------------------->
  // Add item to cart
  const addToCart = async (itemId, size) => {
    let cartData = cloneDeep(cartItems);

    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    // Structure:
    // {
    //   id: {
    //     'M': 1,
    //     'L': 2,
    //     'XL': 3
    //   }
    // }
    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token } }
        );
      } catch (e) {
        console.log("Error in add to cart", e);
        toast.error("Failed to add item to cart");
      }
    }
  };

  // Get total count of items in cart
  const getCartCount = () => {
    let totalCount = 0;
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        try {
          if (cartItems[itemId][size]) {
            totalCount += cartItems[itemId][size];
          }
        } catch (e) {
          console.log("Error in cart count", e);
        }
      }
    }
    return totalCount;
  };

  // Update quantity for specific item and size
  const updateQuantity = async ({ itemId, size, quantity }) => {
    let cartData = cloneDeep(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (e) {
        console.log(e);
        toast.error("Failed to update cart");
      }
    }
  };

  // Calculate total cart amount (including delivery fee)
  const getCartAmount = () => {
    if (!products.length) return 0;

    let totalAmount = 0;
    for (const itemId in cartItems) {
      const product = products.find((product) => product._id === itemId);
      for (const size in cartItems[itemId]) {
        try {
          if (cartItems[itemId][size]) {
            totalAmount +=
              product.price * cartItems[itemId][size] +
              delivery_fee * cartItems[itemId][size];
          }
        } catch (e) {
          console.log("Error in cart amount", e);
        }
      }
    }
    return totalAmount;
  };

  // Fetch cart data from backend
  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        { userId: token },
        { headers: { token } }
      );

      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (e) {
      console.log("Error in get cart items", e);
      toast.error("Failed to load cart items");
    }
  };

  // Fetch products from backend
  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  // Fetch user data from backend
  const getUserData = async (token) => {
    if (!token) return;

    try {
      console.log("Token in getUserData:", token);
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

  // Fetch all subscribers


  //<-------------------------------------------------- useEffect Hooks -------------------------------------------------->

  // Initial fetch of products and subscribers
  useEffect(() => {
    getProductsData();

  }, []);

  // Load token from localStorage and fetch user/cart data
  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      const savedToken = localStorage.getItem("token");
      setToken(savedToken);
      getUserCart(savedToken);
      getUserData(savedToken);
    }
  }, []);

  
// <-------------------------------------------------- useEffect Hooks End -------------------------------------------------->
  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    token,
    setToken,
    getUserCart,
    getProductsData,
    getUserData,
    userData,
    setUserData,
    Subscriber,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
