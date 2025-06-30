import React, {  useEffect } from 'react'
import { useContext } from 'react'
import Title from './Title';
import { GlobalContext } from "../context/GlobalContext.jsx";
import { CartContext } from "../context/CartContext.jsx";



const CartTotal = ({IsSubcriberornot}) => {
    const {currency , delivery_fee} = useContext(GlobalContext);
    const { getCartCount, getCartAmount } = useContext(CartContext);

    const [actualAmount, setActualAmount] = React.useState(0);


 useEffect(() => {
    if (getCartCount() > 0) {
      setActualAmount(getCartAmount() + delivery_fee - (IsSubcriberornot ? getCartAmount() * 0.2 : 0));
    } else {
        setActualAmount(0);
    }
    }, [getCartCount, getCartAmount]);

  return (
    <div className="w-full">
      <div className="text-2xl ">
        <Title text1={"CART"} text2={"TOTAL"} />
      </div>
      {IsSubcriberornot && (
        <p className="text-green-500">Subscriber Discount Applied (20%)</p>
      )}
      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <div className="flex flex-row items-end">
            <p className={`${IsSubcriberornot ? "line-through" : ""}`}>
              {currency} {getCartAmount()}
            </p>
            {IsSubcriberornot && (
              <p className="text-green-500">
                 <span className='text-md'> </span> {currency} {   (getCartAmount() * 0.8).toFixed(2)}
              </p>
            )}
          </div>
        </div>
        <hr />
        <div className="flex justify-between">
          <p>Shipping Fee</p>

          {getCartCount() === 0 ? (
            <p>0</p>
          ) : (
            <p>
              {currency} {delivery_fee}
            </p>
          )}
        </div>
        <hr />
        <div className="flex justify-between">
          <b className="font-semibold">Total</b>
          <b className="font-semibold">
            {currency}{" "}
            {actualAmount.toFixed(2)}
          </b>
        </div>
      </div>
    </div>
  );
}

export default CartTotal