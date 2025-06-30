import React, { use } from 'react'
import { useEffect } from 'react'
import Title from './Title'
import ProductItem from './ProductItem'
import { ProductContext } from "../context/ProductContext.jsx";

const ReletedProducts = ({category,subCategory}) => {
  const{products} = React.useContext(ProductContext )
  const[releted , setReleted] = React.useState([])

  useEffect(() => {
    if(products.length>0){
      let productcopy = [...products];

      productcopy = productcopy.filter((item) => {
        const isCategoryMatch = category.length
          ? category.includes(item.category)
          : true;
        const isSubCategoryMatch = subCategory.length
          ? subCategory.includes(item.subCategory)
          : true;
        return isCategoryMatch && isSubCategoryMatch;
      });
      setReleted(productcopy.slice(0, 5));
    }
  },[products])
  return (
    <div className='my-24'>
      <div className='text-center text-3xl py-2 ' >
        <Title text1={'RELATED'} text2={'PRODUCTS'}></Title>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5  gap-5 gap-y-6'>
        {releted.map((item, index) => (
       <ProductItem
              key={index}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
            />
        ))}
        

      </div>
    </div>
  )
}

export default ReletedProducts