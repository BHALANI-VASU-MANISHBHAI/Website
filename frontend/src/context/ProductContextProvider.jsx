import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
// import socket from "../services/sockets.jsx";
// import socket from "../../../shared/socket/socketManager.js";
import { GlobalContext } from "./GlobalContext";
import { ProductContext } from "./ProductContext";
import SOCKET_EVENTS from "../../../shared/socket/events.js";
import { on, off, emit } from "../../../shared/socket/socketManager.js"; // Import socket manager functions

const ProductContextProvider = ({ children }) => {
  const { backendUrl } = useContext(GlobalContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (products.length > 0) return; // Prevent fetching if products are already loaded
    getProductsData(); // Initial product fetch
  }, []);

  useEffect(() => {
    // ✅ Join stock room

    emit(SOCKET_EVENTS.JOIN_STOCK_ROOM);

    // ✅ Socket listener for new product addition
    on(SOCKET_EVENTS.PRODUCT_ADDED, (data) => {
      toast.success(data.message || "New product added!");
      setProducts((prevProducts) => [...prevProducts, data.product]);
    });

    // ✅ Socket listener for product updates
    on(SOCKET_EVENTS.PRODUCT_UPDATED, (data) => {
      // toast.success(data.message || "Product updated!");
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === data.productId
            ? { ...product, ...data.updatedFields }
            : product
        )
      );
    });

    // ✅ Socket listener for product deletion
    on(SOCKET_EVENTS.PRODUCT_DELETED, (data) => {
      toast.success(data.message || "Product deleted!");
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== data.productId)
      );
    });

    // ✅ Real-time stock update listener
    on(SOCKET_EVENTS.STOCK_UPDATED, (data) => {
      setProducts((prevProducts) =>
        prevProducts.map((product) => {
          if (product._id === data.productId) {
            const updatedStock = product.stock.map((stockItem) => {
              if (stockItem.size === data.size) {
                return {
                  ...stockItem,
                  quantity: stockItem.quantity - data.quantitySold,
                };
              }
              return stockItem;
            });
            return { ...product, stock: updatedStock };
          }
          return product;
        })
      );
    });

    // ✅ Cleanup on unmount
    return () => {
      emit(SOCKET_EVENTS.LEAVE_STOCK_ROOM);
      off(SOCKET_EVENTS.PRODUCT_ADDED);
      off(SOCKET_EVENTS.PRODUCT_UPDATED);
      off(SOCKET_EVENTS.PRODUCT_DELETED);
      off(SOCKET_EVENTS.STOCK_UPDATED);
    };
  }, []);

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
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

  const value = {
    products,
    setProducts,
    getProductsData,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

export default ProductContextProvider;
