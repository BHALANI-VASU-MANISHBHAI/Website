  import { useContext, useState } from "react";
  import Title from "./../components/Title";
  import { useEffect } from "react";
  import { assetss } from "./../assets/frontend_assets/assetss";
  import CartTotal from "../components/CartTotal";
import { GlobalContext } from "../context/GlobalContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import { ProductContext } from "../context/ProductContext.jsx";


  const Cart = () => {
    // products, currency, cartItems, updateQuantity,navigate ,getCartCount
    const { currency, navigate} = useContext(GlobalContext);
    const { cartItems, updateQuantity, getCartCount } = useContext(CartContext);
    const { products } = useContext(ProductContext);
    // console.log("cartItems", cartItems);
    const [cartData, setCartData] = useState([]);
    // console.log("cartData", cartData);
// this is because may be products is not loaded yet.
    useEffect(() => {
 if(products.length>0){
      const tempdata = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item]) {
            tempdata.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempdata);
      const cartCount = getCartCount();
      console.log("cartCount", cartCount);
    }
    }, [cartItems, products]);

    return (
      <div className="boreder t pt-14">
         <div className=" transition-opacity ease-in duration-500 opacity-100 block sm:hidden">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 text-sm"
        >
          ← Back
        </button>
      </div>
        <div className="text-2xl mb-3">
          <Title text1={"YOUR"} text2={"CART"} />
        </div>

        <div>
          {cartData.map((item, index) => {
      
            const ProductData = products.find(
              (product) => product._id === item._id
            );
            if (!products.length) {
  return <div className="text-center py-10">Loading cart...</div>;
}
            //remember that when you delete or add item then no take key as a index
            return (
              <div
                key={`${item._id}-${item.size}`}
                className="py-4 border-t border-b text-gray-700 grid grid-cols[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4 "
              >
                <div className="flex items-start gap-6">
                  <img
                    className="w-16 sm:w-20"
                    src={ProductData.image[0]}
                    alt=""
                  />
                  <div>
                    <p className="text-xs sm:text-lg font-medium">
                      {" "}
                      {ProductData.name}
                    </p>
                    <div className="flex items-center gap-5 mt-2">
                      <p className="">
                        {" "}
                        {currency} 
                       <span className={`${ProductData.discount>0?'line-through' :''}`} > {ProductData.price .toFixed(2)}</span>
                        {
                          ProductData.discount>0 &&
                          
                          <span className=" text-gray-500  ml-2">
                            {currency} {(ProductData.price * (1 - ProductData.discount / 100)).toFixed(2)}
                            </span>
                        }
                        
                      </p>
                      <p className="px-2 sm:px-3 sm:py-1  bg-slate-50">
                        {" "}
                        {item.size}
                      </p>
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  min={1}
                  max ={ProductData.stock[0].quantity}
                  onChange={(e) => e.target.value==='' ||e.target.value=='0' ?null : updateQuantity({
                    itemId: item._id,
                    size: item.size,
                    // string input comes 
                    quantity: Number(e.target.value),
                  })}
                  value={item.quantity}
                  className=" max-w-10 sm:max-w-20  sm:px-2 py-1"
                />
                <img
                  onClick={() => {
                    updateQuantity({
                      itemId: item._id,
                      size: item.size,
                      quantity: 0,
                    });
                  }}
                  className="w-4  mr-4 sm:w-5 cursor-pointer"
                  src={assetss.bin_icon}
                  alt=""
                />
              </div>
            );
          })}
          <div className="flex justify-end my-20">
            <div className="w-full sm:w-[450px]">
              <CartTotal/>
              <div className="w-full text-end">
              <button    onClick={ ()=>{
                const cartCount = getCartCount();
                if(cartCount === 0){
                  return;
                }
                navigate("/place-order");
              }}  className="bg-black text-white text-sm my-8 py-3 px-2 cursor-pointer hover:bg-orange-400 transition-all duration-300 ease-in-out w-full sm:w-[200px]">
                PROCCED TO CHECKOUT 
              </button>

            </div>
              
            </div>
          
          </div>
        </div>
      </div>
    );
  };

  export default Cart;
