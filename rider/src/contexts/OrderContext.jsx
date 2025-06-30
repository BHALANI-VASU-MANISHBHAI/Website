import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { GlobalContext } from './GlobalContext';


export const OrderContext = React.createContext();

const OrderContextProvider = ({ children }) => {

const [orderHistory, setOrderHistory] = useState([]);
const [currentOrder, setCurrentOrder] = useState(null);

  const {token,backendUrl} = useContext(GlobalContext);

const getCurrentOrder = async () => {
    try {
        console.log("backendUrl:", backendUrl);
        const response = await axios.get(backendUrl+'/api/rider/currentOrder', {
            headers: {
                token}
        });
        console.log("Response from getCurrentOrder:", response.data.success);
        if (response.data.success) {
            const order = response.data.order;
            setCurrentOrder(order);
            console.log("🚚 Current order fetched:", order);
        } else {
            toast.error(response.data.message || "Failed to fetch current order");
        }
    }catch (error) {
        console.error("Error fetching current order:", error);
        toast.error(response.data.message || "Error fetching current order");
    } 
  }

useEffect(() => {
    if(!token) {
        return;
    }
    if(!currentOrder) {
        getCurrentOrder();
    }
}, [token]);
 const value = {
    orderHistory,
    setOrderHistory,
    currentOrder,
    setCurrentOrder,
};
return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}


export default OrderContextProvider;