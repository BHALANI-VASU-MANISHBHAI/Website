import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import assets from "../assets/assets";
import { useContext } from "react";
import { OrderContext } from "../contexts/OrderContext";

const Orders = ({ token }) => {
  const currency = "₹";
  const { orders, fetchAllOrders } = useContext(OrderContext);

  const [filteredOrders, setFilteredOrders] = useState([]);
  const [category, setCategory] = useState("All");
  const [subCategory, setSubCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [paymentStatus, setPaymentStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [openCategory, setOpenCategory] = useState(false);
  const [openSubCategory, setOpenSubCategory] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openPaymentStatus, setOpenPaymentStatus] = useState(false);

  const allStatusSteps = ["Order Placed", "Packing", "Shipped", "Out for delivery", "Delivered"];

  const stepperSteps = allStatusSteps;

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (err) {
      console.log("Error updating order status: ", err);
      toast.error("Error updating order status");
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (category !== "All") {
      filtered = filtered.filter((order) =>
        order.items.some((item) => item.category === category)
      );
    }

    if (subCategory !== "All") {
      filtered = filtered.filter((order) =>
        order.items.some((item) => item.subCategory === subCategory)
      );
    }

    if (status !== "All") {
      filtered = filtered.filter((order) => order.status === status);
    }

    if (paymentStatus !== "All") {
      filtered = filtered.filter(
        (order) => order.paymentStatus === paymentStatus
      );
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((order) =>
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    filterOrders();
  }, [category, subCategory, status, paymentStatus, searchQuery, orders]);

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">Orders Page</h3>

      {/* Filters */}
      <div className="p-4 flex flex-col lg:flex-row md:items-center md:justify-between gap-4 border border-gray-200 bg-gray-100 rounded-b-md">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2 relative">
            <p>Category</p>
            <b>{category}</b>
            <img
              onClick={() => setOpenCategory(!openCategory)}
              src={assets.dropdown_icon}
              className={`h-3 w-2 cursor-pointer transform ${
                openCategory ? "rotate-90" : ""
              }`}
              alt=""
            />
            {openCategory && (
              <div className="absolute top-6 left-4 bg-white shadow-lg rounded-md p-2 z-10 w-24">
                {["All", "Men", "Women", "Kids"].map((cat) => (
                  <p
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setOpenCategory(false);
                    }}
                    className="hover:bg-gray-300 cursor-pointer p-1 rounded-md"
                  >
                    {cat}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* SubCategory Filter */}
          <div className="flex items-center gap-2 relative">
            <p>SubCategory</p>
            <b>{subCategory}</b>
            <img
              onClick={() => setOpenSubCategory(!openSubCategory)}
              src={assets.dropdown_icon}
              className={`h-3 w-2 cursor-pointer transform ${
                openSubCategory ? "rotate-90" : ""
              }`}
              alt=""
            />
            {openSubCategory && (
              <div className="absolute top-6 left-4 bg-white shadow-lg rounded-md p-2 z-10 w-28">
                {["All", "Bottomwear", "Topwear", "Winterwear"].map((sub) => (
                  <p
                    key={sub}
                    onClick={() => {
                      setSubCategory(sub);
                      setOpenSubCategory(false);
                    }}
                    className="hover:bg-gray-300 cursor-pointer p-1 rounded-md"
                  >
                    {sub}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 relative">
            <p>Status</p>
            <b>{status}</b>
            <img
              onClick={() => setOpenStatus(!openStatus)}
              src={assets.dropdown_icon}
              className={`h-3 w-2 cursor-pointer transform ${
                openStatus ? "rotate-90" : ""
              }`}
              alt=""
            />
            {openStatus && (
              <div className="absolute top-6 left-4 bg-white shadow-lg rounded-md p-2 z-10 w-32">
                {[
                  "All",
                  "Order Placed",
                  "Shipped",
                  "Delivered",
                  "Cancelled",
                  "Out for delivery",
                  "Packing",
                ].map((stat) => (
                  <p
                    key={stat}
                    onClick={() => {
                      setStatus(stat);
                      setOpenStatus(false);
                    }}
                    className="hover:bg-gray-300 cursor-pointer p-1 rounded-md"
                  >
                    {stat}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-2 relative">
            <p>Payment</p>
            <b>{paymentStatus}</b>
            <img
              onClick={() => setOpenPaymentStatus(!openPaymentStatus)}
              src={assets.dropdown_icon}
              className={`h-3 w-2 cursor-pointer transform ${
                openPaymentStatus ? "rotate-90" : ""
              }`}
              alt=""
            />
            {openPaymentStatus && (
              <div className="absolute top-6 left-4 bg-white shadow-lg rounded-md p-2 z-10 w-24">
                {["All", "pending", "success"].map((pay) => (
                  <p
                    key={pay}
                    onClick={() => {
                      setPaymentStatus(pay);
                      setOpenPaymentStatus(false);
                    }}
                    className="hover:bg-gray-300 cursor-pointer p-1 rounded-md"
                  >
                    {pay}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Box */}
        <div className="p-3 flex gap-3 items-center relative self-start">
          <img
            className="absolute w-4 left-6 top-1/2 transform -translate-y-1/2"
            src={assets.search_icon}
            alt="Search"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border pl-10 pr-2 py-1 rounded-md w-50 md:w-35"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-full mt-4">
        {filteredOrders.map((order, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 border-2 border-gray-200 p-5 md:p-8 my-3 text-xs sm:text-sm md:text-base text-gray-700 bg-white rounded-md shadow-sm"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <img
                src={assets.parcel_icon}
                alt="Parcel"
                className="w-12 object-cover"
              />
              <div className="flex-1">
                <p className="mt-3 font-medium">
                  {order.address.firstName + " " + order.address.lastName}
                </p>
                <div>
                  <p>
                    {order.address.street}, {order.address.city}
                  </p>
                  <p>
                    {order.address.state}, {order.address.country},{" "}
                    {order.address.zipcode}
                  </p>
                </div>
                <p>Phone: {order.address.phone}</p>
              </div>
              <div className="flex flex-wrap gap-2 self-start flex-col">
                {order.items.map((item, idx) => (
                  <span key={idx} className="text-sm">
                    {item.name} x {item.quantity} ({item.size})
                  </span>
                ))}
              </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between w-full mt-4">
              {stepperSteps.map((step, idx) => {
                const isActive = step === order.status;
                const isCompleted = stepperSteps.indexOf(order.status) > idx;

                return (
                  <div key={idx} className="flex items-center flex-1 relative">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : isActive
                          ? "bg-yellow-400 border-yellow-400 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    {idx < stepperSteps.length - 1 && (
                      <div
                        className={`flex-1 h-1 ${
                          isCompleted ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
              <div>
                <p>Items: {order.items.length}</p>
                <p>Method: {order.paymentMethod}</p>
                <p>
                  Payment:{" "}
                  {order.paymentStatus === "success"
                    ? "Done"
                    : order.paymentStatus === "failed"
                    ? "Failed"
                    : "Pending"}
                </p>
                <p>Date: {new Date(order.date).toLocaleDateString()}</p>
              </div>

              <div className="text-lg font-bold">
                {currency}
                {order.amount}
              </div>

              <div className="flex flex-col items-start sm:items-center gap-2">
                <select
                  onChange={(event) => statusHandler(event, order._id)}
                  value={order.status}
                  className="p-2 font-semibold border rounded-md"
                >
                  {allStatusSteps
                    .map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption}
                      </option>
                    ))}
                </select>

                <div className="flex items-center gap-2 self-start">
                  <p
                    className={`w-3 h-3 rounded-full ${
                      order.status === "Delivered"
                        ? "bg-green-500"
                        : order.status === "Cancelled"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  ></p>
                  <p>{order.status}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
