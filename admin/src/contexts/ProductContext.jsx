import axios from "axios";
import React from "react";
import socket from "../services/socket";
import { useEffect } from "react";
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
    socket.on("product:lowstock:updated", (data) => {
    console.log("Low stock updated in the context :", data);
    //  getLowStocksProduct();
    });
    socket.on("product:outofstock:updated", (data) => {
      console.log("Out of stock updated: int the context ", data);
    //   getLowStocksProduct();
    });
    return () => {
      socket.off("product:lowstock:updated");
      socket.off("product:outofstock:updated");
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
