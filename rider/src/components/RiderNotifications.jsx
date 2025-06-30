import React, { useEffect, useState, useContext } from 'react';
import socket from '../services/socket';
import { toast } from 'react-toastify';
import { UserContext } from '../contexts/UserContext';



const RiderNotifications = () => {

  const { userData } = useContext(UserContext);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [AllOrders, setAllOrders] = useState([]);

  if (!currentOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">New Order Notification</h2>
        <p className="mb-4">You have a new order to pick up!</p>
        <p className="text-sm text-gray-600 mb-4">Order ID: {currentOrder.orderId}</p>
        <button
          onClick={() => {
            setCurrentOrder(null);
            toast.success("Order acknowledged!");
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};

export default RiderNotifications;
