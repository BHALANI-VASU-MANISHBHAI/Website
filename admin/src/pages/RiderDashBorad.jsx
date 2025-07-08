import React, { useContext, useEffect, useState } from "react";
import { RiderContext } from "../contexts/RiderContext.jsx";
import { OrderContext } from "../contexts/OrderContext.jsx";

const RiderDashboard = () => {
  const [stats, setStats] = useState({
    totalRiders: 0,
    activeRiders: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    outForDeliveryOrders: 0,
    packingOrders: 0,
  });

  const { onlineRiders, riderOrders } = useContext(RiderContext);
  const { orders } = useContext(OrderContext);

  const [riderFilter, setRiderFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const [RiderOrders, setRiderOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    setRiderOrders(riderOrders);
    console.log("IN RiderDashboard, Rider Orders:", riderOrders);
  }, [riderOrders]);

  const isOrderInDateRange = (orderDateStr, filterType) => {
    const orderDate = new Date(orderDateStr);
    const now = new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7 = new Date();
    last7.setDate(now.getDate() - 7);
    last7.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    if (filterType === "today") return orderDate >= today;
    if (filterType === "last7days") return orderDate >= last7;
    if (filterType === "thisMonth") return orderDate >= monthStart;
    return true;
  };

  const filterAndSortOrders = () => {
    let filtered = RiderOrders?.filter((order) => {
      if (riderFilter === "all") return true;
      return order.riderId?.riderStatus === riderFilter;
    })
      .filter((order) => {
        if (orderFilter === "all") return true;
        return order.status === orderFilter;
      })
      .filter((order) => {
        if (paymentFilter === "all") return true;
        return (
          order.paymentMethod?.toLowerCase() === paymentFilter.toLowerCase()
        );
      })
      .filter((order) => {
        return isOrderInDateRange(order.createdAt, dateFilter);
      })
      .filter((order) => {
        if (!searchQuery) return true;
        return (
          order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.riderId?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order.riderId?.phone?.includes(searchQuery)
        );
      })
      .sort((a, b) => {
        if (sortBy === "amount") return b.amount - a.amount;
        if (sortBy === "distance")
          return (
            b.distanceFromDeliveryLocation - a.distanceFromDeliveryLocation
          );
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
        
    );
    

    setFilteredOrders(filtered);
  };

  const setRiderStats = () => {
    const totalRiders = RiderOrders?.length || 0;
    const activeRiders =
      RiderOrders?.filter((order) => order.riderId?.riderStatus === "active")
        .length || 0;
    const totalOrders = RiderOrders?.length || 0;
    const deliveredOrders =
      RiderOrders?.filter((order) => order.status === "Delivered").length || 0;
    const cancelledOrders =
      RiderOrders?.filter((order) => order.status === "Cancelled").length || 0;
    const outForDeliveryOrders =
      RiderOrders?.filter((order) => order.status === "Out for delivery")
        .length || 0;
    const packingOrders =
      RiderOrders?.filter((order) => order.status === "Packing").length || 0;
      const shippedOrders =
        RiderOrders?.filter((order) => order.status === "Shipped").length || 0;
    setStats({
      totalRiders,
      activeRiders,
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      outForDeliveryOrders,
      packingOrders,
      shippedOrders,
    });
  };

  useEffect(() => {
    setRiderStats();
  }, [RiderOrders, orders]);

  useEffect(() => {
    filterAndSortOrders();
  }, [
    RiderOrders,
    riderFilter,
    orderFilter,
    paymentFilter,
    sortBy,
    searchQuery,
    dateFilter,
  ]);

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
        <FilterDropdown
          label="Rider Status"
          value={riderFilter}
          setValue={setRiderFilter}
          options={["all", "active", "inactive"]}
        />
        <FilterDropdown
          label="Order Status"
          value={orderFilter}
          setValue={setOrderFilter}
          options={[
            "all",
            "Delivered",
            "Shipped",
            "Out for delivery",
            "Packing",
            "Cancelled",
          ]}
        />
        <FilterDropdown
          label="Payment Method"
          value={paymentFilter}
          setValue={setPaymentFilter}
          options={["all", "COD", "Online"]}
        />
        <FilterDropdown
          label="Sort By"
          value={sortBy}
          setValue={setSortBy}
          options={["date", "amount", "distance"]}
        />
        <FilterDropdown
          label="Date"
          value={dateFilter}
          setValue={setDateFilter}
          options={["all", "today", "last7days", "thisMonth"]}
        />
      </div>

      {/* Stats */}
      <h2 className="text-xl font-semibold mt-6">Dashboard Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
        <StatCard
          title="Total Riders"
          value={stats.totalRiders}
          color="green"
        />
        <StatCard title="Active Riders" value={onlineRiders} color="blue" />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          color="indigo"
        />
        <StatCard
          title="Delivered Orders"
          value={stats.deliveredOrders}
          color="green"
        />
        <StatCard
          title="Cancelled Orders"
          value={stats.cancelledOrders}
          color="red"
        />
        <StatCard
          title="Out for Delivery"
          value={stats.outForDeliveryOrders}
          color="yellow"
        />
        <StatCard
          title="Packing Orders"
          value={stats.packingOrders}
          color="gray"
        />
        <StatCard
          title="Shipped Orders"
          value={stats.shippedOrders}
          color="purple"
        />
      </div>

      {/* Orders */}
      <div className="mt-6">
        <h1 className="text-xl font-semibold text-gray-700">
          Rider Order Details
        </h1>
        <input
          type="text"
          placeholder="Search by Order ID, Rider Name, or Phone"
          className="mt-2 p-2 border border-gray-300 rounded w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-5 mt-4">
          {filteredOrders?.length > 0 ? (
            filteredOrders.map((order, index) => (
              <div
                key={index}
                className="border p-5 rounded-lg shadow bg-white flex flex-col md:flex-row justify-between items-start gap-6"
              >
                {/* Order Info */}
                <div className="text-sm text-gray-800 space-y-2 w-full md:w-1/2">
                  <p>
                    <strong>Order ID:</strong> {order._id}
                  </p>
                  <p>
                    <strong>Status:</strong> {order.status}
                  </p>
                  <p>
                    <strong>Amount:</strong> ₹{order.amount}
                  </p>
                  <p className="flex items-center gap-2">
                    <strong>Payment:</strong> {order.paymentMethod} (
                    {order.paymentStatus})
                    {order.paymentMethod === "COD" && (
                      <span className="ml-2 text-xs text-yellow-700 font-semibold bg-yellow-100 px-2 py-1 rounded">
                        Collect Cash on Delivery
                      </span>
                    )}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                  <p className="text-sm font-semibold text-gray-600 border-t pt-2">
                    Rider Info
                  </p>
                  <p>
                    <strong>Name:</strong> {order.riderId?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.riderId?.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {order.riderId?.email || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {order.riderId?.riderStatus || "N/A"}
                  </p>
                </div>

                {/* Address Info */}
                <div className="text-sm text-gray-800 w-full md:w-1/2 space-y-3">
                  <p className="text-sm font-semibold text-gray-600 border-t pt-2">
                    Address Info
                  </p>
                  <p className="font-semibold">
                    Pickup Address:
                    <span className="font-normal">
                      {" "}
                      {order.pickUpAddress?.street}, {order.pickUpAddress?.city}
                      , {order.pickUpAddress?.state} -{" "}
                      {order.pickUpAddress?.pincode}
                    </span>
                  </p>
                  <p className="font-semibold">
                    Delivery Address:
                    <span className="font-normal">
                      {" "}
                      {order.address?.firstName} {order.address?.lastName},{" "}
                      {order.address?.street}, {order.address?.city},{" "}
                      {order.address?.state} - {order.address?.zipcode}
                    </span>
                  </p>
                  <p>Email: {order.address?.email}</p>
                  <p>Phone: {order.address?.phone}</p>
                  {order.items?.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-700 pt-2">Items:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} - Qty: {item.quantity} (Size:{" "}
                            {item.size})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 mt-4">No rider orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card
const StatCard = ({ title, value, color }) => (
  <div className={`bg-${color}-100 p-5 rounded-md shadow-md`}>
    <p className="text-sm text-gray-600">{title}</p>
    <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
  </div>
);

// Reusable Dropdown
const FilterDropdown = ({ label, value, setValue, options }) => (
  <div className="flex flex-col">
    <label className="text-md font-medium">{label}:</label>
    <select
      className="p-2 border border-gray-300 rounded-md"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </option>
      ))}
    </select>
  </div>
);

export default RiderDashboard;
