import React from 'react';
import axios from 'axios';

export const ProductContext =  React.createContext();



const ProductContextProvider = ({ children ,token}) => {
    const [products, setProducts] = React.useState([]);
    const fetchProduct = async () => {
        try{
            const  responce = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/product/list`, {
                headers: {
                    token: token
                }
            });

            if(responce.data.success){
                setProducts(responce.data.products);
            }else{
                setProducts([]);
                console.log("Failed to fetch products");
            }
        }catch(err){
            console.log("Error fetching products", err);
        }
    }


    // const AddLastProduct 
    const addLastProduct = (product) => {
    setProducts((prevProducts) => [product, ...prevProducts]);
};

    React.useEffect(() => {
        if(token){
            fetchProduct();
        }
    }, [token]);

    const values = {
        products,
        fetchProduct,
        addLastProduct
    };


    return (
        <ProductContext.Provider value={values}>
            {children}
        </ProductContext.Provider>
    );
}

export default ProductContextProvider;

