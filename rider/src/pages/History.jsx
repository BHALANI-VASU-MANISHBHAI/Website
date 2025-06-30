import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../contexts/GlobalContext";
import axios from "axios";
import { toast } from "react-toastify";


const History = () => {
  const { backendUrl, token } = useContext(GlobalContext);
  const [orderHistory, setOrderHistory] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState("All");
  const [status, setStatus] = useState("All");

  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [startTime, setStartTime] = useState("12 AM");
  const [endTime, setEndTime] = useState("11 PM");

    const [codCollected, setCodCollected] = useState(0);
  const getRiderAcceptedOrders = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/rider/acceptedOrder`, {
        headers: { token }
      });
      if (response.data.success) {
        setOrderHistory(response.data.orders);
        console.log("Rider's accepted orders:", response.data.orders[0].earning);
      } else {
        toast.error(response.data.message || "Failed to fetch rider's accepted orders");
      }
    } catch (error) {
      console.error("Error fetching rider's accepted orders:", error);
      toast.error(error.response?.data?.message || "Error fetching rider's accepted orders");
    }
    };

  const convertTo24Hour = (timeStr) => {
    const [hour, period] = timeStr.split(" ");
    let h = parseInt(hour);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h;
  };

  const filterOrders = () => {
    let filtered = [...orderHistory];

    if (paymentMethod !== "All") {
      filtered = filtered.filter((order) => order.paymentMethod === paymentMethod);
    }

    if (status !== "All") {
      filtered = filtered.filter((order) => order.status === status);
    }

    const startHour = convertTo24Hour(startTime);
    const endHour = convertTo24Hour(endTime);

    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHour, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endHour, 59, 59, 999);

    filtered = filtered.filter((order) => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= startDateTime && createdAt <= endDateTime;
    });

    setFilteredOrders(filtered);
  };

const codCollectedMoney = () => {
    console.log("Calculating COD collected...");
    console.log("Payment method:", paymentMethod);
   if (paymentMethod !== "COD" && paymentMethod !== "All") {
  return 0;
}

    console.log("Payment method is COD, calculating total collected...");
    let totalCollected = 0;
    filteredOrders.forEach((order) => { {
            totalCollected += order.amount;
        }
    });
  console.log("Total COD collected:", totalCollected);
  setCodCollected(totalCollected);
  return totalCollected;
};


   
  useEffect(() => {
    if (!token) return;
    getRiderAcceptedOrders();
  }, [token]);

  useEffect(() => {
    filterOrders();
    
  }, [orderHistory, paymentMethod, status, startDate, endDate, startTime, endTime]);


useEffect(() => {
  codCollectedMoney(); // this will run only AFTER filteredOrders is updated
}, [filteredOrders]);

  const timeOptions = [...Array(12).keys()].map((i) => `${i + 1} AM`)
    .concat([...Array(12).keys()].map((i) => `${i + 1} PM`));

  const resetFilters = () => {
    setPaymentMethod("All");
    setStatus("All");
    setStartDate(today);
    setEndDate(today);
    setStartTime("12 AM");
    setEndTime("11 PM");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📜 Rider Order History</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="All">All</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Delivered">Delivered</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Payment Method:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="All">All</option>
            <option value="COD">Cash on Delivery</option>
            <option value="Online">Online Payment</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Start Time:</label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">End Time:</label>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
            <div className="flex items-end">
          <button onClick={resetFilters} className="w-full p-2 bg-gray-200 rounded-md hover:bg-gray-300">
            Reset Filters
          </button>
        </div>
      </div>


      {/* Filter Summary */}
      <p className="text-sm text-gray-500 mb-4">
        Showing orders from <strong>{startDate}</strong> <strong>{startTime}</strong> to <strong>{endDate}</strong> <strong>{endTime}</strong>
      </p>
            <h1 className="text-xl mb-5">{codCollected > 0 ? ` Total COD Collected: ₹${codCollected}` : "No COD collected yet"}</h1>
      {/* Order List */}
      {filteredOrders.length > 0 ? (
        <ul className="space-y-6">
          {filteredOrders.map((order) => (
            <li key={order._id} className="border p-4 rounded-lg bg-white shadow">
              <p><strong>🆔 Order ID:</strong> {order._id}</p>
              <p><strong>🧾 Status:</strong> {order.status}</p>
              <p><strong>💰 Amount:</strong> ₹{order.amount}</p>
              <p>
                <strong>💳 Payment:</strong> {order.paymentMethod} ({order.paymentStatus})
                {order.paymentMethod === "COD" && (
                  <>
                    <span className="ml-2 text-sm text-yellow-600 font-semibold bg-yellow-100 px-2 py-1 rounded">Collect Cash on Delivery</span>
                    {order.paymentStatus === "Unpaid" && (
                      <span className="ml-2 text-sm text-red-600 font-semibold">🛑 Payment Pending</span>
                    )}
                  </>
                )}
              </p>
              <p><strong>📆 Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
<p>
  <strong>⏰ Time:</strong>{" "}
  {new Date(order.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}
</p>

              <hr className="my-2" />
              <p><strong>📍 Pickup Address:</strong> {order.pickUpAddress?.street}, {order.pickUpAddress?.city}, {order.pickUpAddress?.state} - {order.pickUpAddress?.pincode}</p>
              <p className="mt-2"><strong>🏠 Delivery Address:</strong> {order.address?.firstName} {order.address?.lastName}, {order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.zipcode}</p>
              <p>Email: {order.address?.email} | Phone: {order.address?.phone}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No orders found for selected filters.</p>
      )}
    </div>
  );
};

export default History;
