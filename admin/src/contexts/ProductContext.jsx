import axios from "axios";
import React from "react";
// import socket from "../services/socket";
// import socket from "../../../shared/socket/socketMa
import { useEffect } from "react";
import SOCKET_EVENTS from "../../../shared/socket/events";
import { on, off } from "../../../shared/socket/socketManager";
export const ProductContext = React.createContext();

const ProductContextProvider = ({ children, token }) => {
  const [products, setProducts] = React.useState([]);
  const fetchProduct = async () => {
    try {
      const responce = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/product/list`,
        {
          headers: {
            token: token,
          },
        }
      );

      if (responce.data.success) {
        setProducts(responce.data.products);
      } else {
        setProducts([]);
        console.log("Failed to fetch products");
      }
    } catch (err) {
      console.log("Error fetching products", err);
    }
  };

  // const AddLastProduct
  const addLastProduct = (product) => {
    setProducts((prevProducts) => [product, ...prevProducts]);
  };

  // we used the soket to add the product chnaged real time Low Stock

  useEffect(() => {
    on(SOCKET_EVENTS.PRODUCT_LOW_STOCK_UPDATED, (data) => {
      console.log("Low stock updated in the context :", data);
      getLowStocksProduct();
    });
    on(SOCKET_EVENTS.PRODUCT_OUT_OF_STOCK_UPDATED, (data) => {
      console.log("Out of stock updated: int the context ", data);
      getLowStocksProduct();
    });
    return () => {
      off(SOCKET_EVENTS.PRODUCT_LOW_STOCK_UPDATED);
      off(SOCKET_EVENTS.PRODUCT_OUT_OF_STOCK_UPDATED);
    };
  }, []);

  React.useEffect(() => {
    if (token) {
      fetchProduct();
    }
  }, [token]);

  const values = {
    products,
    fetchProduct,
    addLastProduct,
  };

  return (
    <ProductContext.Provider value={values}>{children}</ProductContext.Provider>
  );
};

export default ProductContextProvider;
