import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import socket from "../services/sockets.jsx";
import { GlobalContext } from "./GlobalContext";
import { ProductContext } from "./ProductContext";

const ProductContextProvider = ({ children }) => {
  const { backendUrl } = useContext(GlobalContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if(products.length > 0) return; // Prevent fetching if products are already loaded
    getProductsData(); // Initial product fetch
  }, []);

  useEffect(() => {
    // ✅ Join stock room
    socket.emit('joinStockRoom');

    // ✅ Socket listener for new product addition
    socket.on("product:added", (data) => {
      toast.success(data.message || "New product added!");
      setProducts((prevProducts) => [...prevProducts, data.product]);
    });

    // ✅ Socket listener for product updates
    socket.on("product:updated", (data) => {
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
    socket.on("product:deleted", (data) => {
      toast.success(data.message || "Product deleted!");
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== data.productId)
      );
    });

    // ✅ Real-time stock update listener
    socket.on("stock:updated", (data) => {
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
      socket.emit('leaveStockRoom');
      socket.off("product:added");
      socket.off("product:updated");
      socket.off("product:deleted");
      socket.off("stock:updated");
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
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContextProvider;
