import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../contexts/GlobalContext";
import { OrderContext } from "../contexts/OrderContext";

const History = () => {
  const { backendUrl, token } = useContext(GlobalContext);
  const { orderHistory } = useContext(OrderContext);


  const [allOrdersHistory, setAllOrdersHistory] = useState(orderHistory);
  useEffect(() => {
    setAllOrdersHistory(orderHistory);
  }, [orderHistory]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("All");
  const [status, setStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [startTime, setStartTime] = useState("12 AM");
  const [endTime, setEndTime] = useState("11 PM");
  const [codCollected, setCodCollected] = useState(0);

  const [datePreset, setDatePreset] = useState("Today");

  const convertTo24Hour = (timeStr) => {
    const [hour, period] = timeStr.split(" ");
    let h = parseInt(hour);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h;
  };




  useEffect(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (datePreset) {
      case "Today":
        break;
      case "Yesterday":
        start.setDate(now.getDate() - 1);
        end.setDate(now.getDate() - 1);
        break;
      case "Last 7 Days":
        start.setDate(now.getDate() - 6);
        break;
      case "This Month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "Custom":
      default:
        return;
    }

    const formatDate = (date) => date.toISOString().split("T")[0];
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
    setStartTime("12 AM");
    setEndTime("11 PM");
  }, [datePreset]);

  const filterOrders = () => {
    let filtered = [...allOrdersHistory];

    if (paymentMethod !== "All") {
      filtered = filtered.filter(
        (order) => order.paymentMethod === paymentMethod
      );
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
    console.log("Start DateTime:", startDateTime);
    console.log("End DateTime:", endDateTime);
    console.log("filtered orders:", filtered);
    console.log("Filtered orders after date and time:", filtered);
    if (searchQuery.trim()) {
      filtered = filtered.filter((order) =>
        order._id.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const codCollectedMoney = () => {
    if (paymentMethod !== "COD" && paymentMethod !== "All") return 0;
    let total = 0;
    filteredOrders.forEach((order) => {
      total += order.amount;
    });
    setCodCollected(total);
    return total;
  };

  useEffect(() => {
    filterOrders();
  }, [
    allOrdersHistory,
    paymentMethod,
    status,
    startDate,
    endDate,
    startTime,
    endTime,
    searchQuery,
  ]);

  useEffect(() => {
    codCollectedMoney();
  }, [filteredOrders]);

  const timeOptions = [...Array(12).keys()]
    .map((i) => `${i + 1} AM`)
    .concat([...Array(12).keys()].map((i) => `${i + 1} PM`));

  const resetFilters = () => {
    setPaymentMethod("All");
    setStatus("All");
    setSearchQuery("");
    setDatePreset("Today");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Rider Order History</h1>

      {/* 🔍 Search by Order ID */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Quick Date Presets */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Quick Date Range:
        </label>
        <select
          value={datePreset}
          onChange={(e) => setDatePreset(e.target.value)}
          className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md"
        >
          <option value="Today">Today</option>
          <option value="Yesterday">Yesterday</option>
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="This Month">This Month</option>
          <option value="Custom">Custom</option>
        </select>
      </div>

      {/* Manual Filters (shown only for Custom) */}
      {datePreset === "Custom" && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Start Date:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              End Date:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Start Time:
            </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              End Time:
            </label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Status & Payment Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Status:
          </label>
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
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Payment Method:
          </label>
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
        <div className="flex items-end">
          <button
            onClick={resetFilters}
            className="w-full p-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-500 mb-4">
        Showing orders from <strong>{startDate}</strong>{" "}
        <strong>{startTime}</strong> to <strong>{endDate}</strong>{" "}
        <strong>{endTime}</strong>
      </p>

      <h1 className="text-xl mb-5">
        {codCollected > 0
          ? ` Total COD Collected: ₹${codCollected}`
          : "No COD collected yet"}
      </h1>

      {/* Orders */}
      {filteredOrders.length > 0 ? (
        <ul className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="p-4 border border-gray-300 rounded-md shadow-sm bg-white grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="space-y-3">
                <p>
                  <strong>Order ID:</strong> {order._id}
                </p>
                <p>
                  <strong>Status:</strong> {order.status}
                </p>
                <p>
                  <strong>Amount:</strong> ₹{order.amount}
                </p>
                <p>
                  <strong>Payment:</strong> {order.paymentMethod} (
                  {order.paymentStatus})
                  {order.paymentMethod === "COD" && (
                    <>
                      <span className="ml-2 text-sm text-yellow-600 font-semibold bg-yellow-100 px-2 py-1 rounded">
                        Collect Cash on Delivery
                      </span>
                      {order.paymentStatus === "Unpaid" && (
                        <span className="ml-2 text-sm text-red-600 font-semibold">
                          Payment Pending
                        </span>
                      )}
                    </>
                  )}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col space-y-10">
                <div>
                  <p>
                    <strong>Pickup Address:</strong>{" "}
                    {order.pickUpAddress?.street}, {order.pickUpAddress?.city},{" "}
                    {order.pickUpAddress?.state} -{" "}
                    {order.pickUpAddress?.pincode}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="mt-2">
                    <strong>Delivery Address:</strong>{" "}
                    {order.address?.firstName} {order.address?.lastName},{" "}
                    {order.address?.street}, {order.address?.city},{" "}
                    {order.address?.state} - {order.address?.zipcode}
                  </p>
                  <p>Email: {order.address?.email}</p>
                  <p>Phone: {order.address?.phone}</p>
                </div>
              </div>
            </div>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No orders found for selected filters.</p>
      )}
    </div>
  );
};

export default History;
