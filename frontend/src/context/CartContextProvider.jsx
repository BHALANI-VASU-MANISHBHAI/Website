import  {  useState, useEffect, useContext } from "react";
import cloneDeep from "lodash-es/cloneDeep";
import { toast } from "react-toastify";
import axios from "axios";
import { GlobalContext } from "./GlobalContext";
import { ProductContext } from "./ProductContext";
import { CartContext } from "./CartContext";

const CartContextProvider = ({ children }) => {
  const { backendUrl, token } = useContext(GlobalContext);
  const {products} = useContext(ProductContext);
  const [cartItems, setCartItems] = useState({});

  // Automatically fetch cart when token changes
  useEffect(() => {
  
    const fetchCart = async () => {
      if (!token) return;
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
    fetchCart();
  
  }, [token]);

  const addToCart = async (itemId, size) => {
    let cartData = cloneDeep(cartItems);

    if (!size) {
      toast.error("Select Product Size");
      return;
    }
    const product = products.find((product) => product._id === itemId);
    const Stock = product.stock.find((stock) => stock.size === size);
    if (cartData[itemId] ) {
      if(cartData[itemId][size] && cartData[itemId][size] >= Stock.quantity) {
        toast.error("You have already added maximum quantity of this item");
        return;
      }
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
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

  const getCartCount = () => {
    let totalCount = 0;
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        totalCount += cartItems[itemId][size] || 0;
      }
    }
    return totalCount;
  };

 

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

  const getCartAmount = () => {
   if (!products.length) return 0;

    let totalAmount = 0;
    for (const itemId in cartItems) {
      const product = products.find((product) => product._id === itemId);
      for (const size in cartItems[itemId]) {
        try {
          if (cartItems[itemId][size]) {
            totalAmount +=
              product.price * cartItems[itemId][size] *(product.discount ? (1 - product.discount / 100) : 1);
          }
        } catch (e) {
          console.log("Error in cart amount", e);
        }
      }
    }
    return totalAmount;
  };

  
  const value = {
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContextProvider;