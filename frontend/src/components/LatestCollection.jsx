import React, { useContext, useEffect, useState } from 'react';
import Title from './Title';
import ProductItem from './ProductItem';
import ShimmerCard from './ShimmerCard'; // You must create this component
import { ProductContext } from "../context/ProductContext.jsx";

const LatestCollection = () => {
  const { products } = useContext(ProductContext);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true); // loading state

  useEffect(() => {
    if (products.length > 0) {
      setLatestProducts(products.slice(0, 10));
      setLoading(false);
    }
  }, [products]);

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1="Latest" text2="Collection" />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Explore the newest arrivals — fresh fashion styles curated just for you. Stay ahead with our latest drops featuring seasonal must-haves, trending designs, and everyday essentials.
        </p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6 px-4'>
        {loading
          ? Array(8).fill().map((_, idx) => <ShimmerCard key={idx} />) // Use ShimmerCard for loading state
          : latestProducts.map((item, index) => (
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

export default LatestCollection;
