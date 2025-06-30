import { useContext, useEffect, useState } from 'react';
import Title from './Title';
import ProductItem from './ProductItem';
import { ProductContext } from "../context/ProductContext.jsx";
import ShimmerCard from './ShimmerCard'; // You must create this component
import axios from 'axios';
import socket from '../services/sockets.jsx'; // Ensure you have a socket connection set up
import { toast } from 'react-toastify';
import { GlobalContext } from '../context/GlobalContext.jsx';
const BestSeller = () => {
  const { products } = useContext(ProductContext);
  const { backendUrl } = useContext(GlobalContext);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
 useEffect(() => {
    getBestSellerProducts();
}, [products]);

const getBestSellerProducts = async () => {
    setLoading(true); // Start loading when fetching starts
    try {
        console.log("Backend URL:", backendUrl);
        const response = await axios.get(`${backendUrl}/api/product/bestsellers`);

        if (response.data.success) {
            const bestProducts = response.data.products;
            setBestSellerProducts(bestProducts);
            console.log("Best Seller Products:", bestProducts);
        } else {
            toast.error(response.data.message || "Failed to fetch best seller products.");
            console.log("Failed to fetch best seller products:", response.data.message);
        }
    } catch (error) {
        console.log("Error fetching best seller products:", error);
    } finally {
        setLoading(false); // ✅ Properly stop loading after fetch is done
    }
};
useEffect(() => {
  socket.on("bestsellerUpdated", () => {
    toast.success("Best seller products updated!");
    getBestSellerProducts(); // refetch via API
  });

  return () => socket.off("bestsellerUpdated");
}, []);




  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1="Best" text2="Seller" />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Discover our most-loved fashion picks — the perfect blend of comfort, style, and quality. From everyday essentials to trend-setting designs, shop the pieces everyone’s talking about.
        </p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6 px-4'>
        {loading
          ? Array(6).fill().map((_, idx) => ( <ShimmerCard key={idx} /> )) // Use ShimmerCard for loading state
          : bestSellerProducts.map((item, index) => (
              <ProductItem
                key={item._id || index}
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
            ))
        }
      </div>
    </div>
  );
};

export default BestSeller;
