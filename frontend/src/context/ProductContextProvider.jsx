import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { GlobalContext } from "./GlobalContext";
import { ProductContext } from "./ProductContext";
import socket from "../services/sockets.jsx";

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
    socket.on('productAdded', (data) => {
      toast.success(data.message || "New product added!");
      setProducts((prevProducts) => [...prevProducts, data.product]);
    });

    // ✅ Socket listener for product updates
    socket.on('productUpdated', (data) => {
      toast.success(data.message || "Product updated!");
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === data.productId ? { ...product, ...data.updatedFields } : product
        )
      );
    });

    // ✅ Socket listener for product deletion
    socket.on('productDeleted', (data) => {
      toast.success(data.message || "Product deleted!");
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== data.productId)
      );
    });

    // ✅ Real-time stock update listener
    socket.on('stockUpdated', (data) => {
      setProducts((prevProducts) =>
        prevProducts.map((product) => {
          if (product._id === data.productId) {
            const updatedStock = product.stock.map((stockItem) => {
              if (stockItem.size === data.size) {
                return { ...stockItem, quantity: stockItem.quantity - data.quantitySold };
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
      socket.off('productAdded');
      socket.off('productUpdated');
      socket.off('productDeleted');
      socket.off('stockUpdated');
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
