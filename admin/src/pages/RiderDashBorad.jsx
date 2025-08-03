import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { RiderContext } from "../contexts/RiderContext.jsx";
import StatCard from "../components/StatCard.jsx";
import RiderOrderCard from "../components/RiderOrderCard.jsx";

// Memoized FilterDropdown component
const FilterDropdown = React.memo(({ label, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="text-md font-medium">{label}:</label>
    <select
      className="p-2 border border-gray-300 rounded-md"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </option>
      ))}
    </select>
  </div>
));

// Memoized DateInput component
const DateInput = React.memo(({ label, value, onChange, min, max }) => (
  <div className="flex items-center gap-2">
    <label className="text-md font-medium">{label}:</label>
    <input
      type="date"
      className="p-2 border border-gray-300 rounded-md"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max || new Date().toISOString().split("T")[0]}
    />
  </div>
));

const RiderDashboard = () => {
  // Contexts
  const { onlineRiders, riderOrders = [] } = useContext(RiderContext);

  // Consolidated state
  const [filters, setFilters] = useState({
    rider: "all",
    order: "all",
    payment: "all",
    sort: "date",
    date: "all",
    search: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const [stats, setStats] = useState({
    totalRiders: 0,
    activeRiders: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    outForDeliveryOrders: 0,
    packingOrders: 0,
    shippedOrders: 0,
  });

  // Handle filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  }, []);

  // Date range check
  const isOrderInDateRange = useCallback(
    (orderDateStr, filterType) => {
      const orderDate = new Date(orderDateStr);
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const last7 = new Date();
      last7.setDate(new Date().getDate() - 7);
      last7.setHours(0, 0, 0, 0);

      const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );

      if (filterType === "today")
        return orderDate >= today && orderDate < tomorrow;
      if (filterType === "last7days")
        return orderDate >= last7 && orderDate < tomorrow;
      if (filterType === "thisMonth")
        return orderDate >= monthStart && orderDate < tomorrow;
      if (filterType === "Custom" && filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return orderDate >= start && orderDate <= end;
      }

      return true;
    },
    [filters.startDate, filters.endDate]
  );

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = riderOrders.filter((order) => {
      return (
        (filters.rider === "all" ||
          order.riderId?.riderStatus === filters.rider) &&
        (filters.order === "all" || order.status === filters.order) &&
        (filters.payment === "all" ||
          order.paymentMethod?.toLowerCase() ===
            filters.payment.toLowerCase()) &&
        isOrderInDateRange(order.createdAt, filters.date) &&
        (!filters.search ||
          order._id.toLowerCase().includes(filters.search.toLowerCase()) ||
          order.riderId?.name
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          order.riderId?.phone?.includes(filters.search))
      );
    });

    // Sorting
    return result.sort((a, b) => {
      if (filters.sort === "amount") return b.amount - a.amount;
      if (filters.sort === "distance") {
        return (
          (b.distanceFromDeliveryLocation || 0) -
          (a.distanceFromDeliveryLocation || 0)
        );
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [riderOrders, filters, isOrderInDateRange]);

  // Calculate stats
  useEffect(() => {
    const newStats = {
      totalRiders: riderOrders.length,
      activeRiders: 0,
      totalOrders: riderOrders.length,
      deliveredOrders: 0,
      cancelledOrders: 0,
      outForDeliveryOrders: 0,
      packingOrders: 0,
      shippedOrders: 0,
    };

    riderOrders.forEach((order) => {
      const { status, riderId } = order;
      if (riderId?.riderStatus === "active") newStats.activeRiders++;

      switch (status) {
        case "Delivered":
          newStats.deliveredOrders++;
          break;
        case "Cancelled":
          newStats.cancelledOrders++;
          break;
        case "Out for delivery":
          newStats.outForDeliveryOrders++;
          break;
        case "Packing":
          newStats.packingOrders++;
          break;
        case "Shipped":
          newStats.shippedOrders++;
          break;
        default:
          break;
      }
    });

    setStats(newStats);
  }, [riderOrders]);

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
        <FilterDropdown
          label="Rider Status"
          value={filters.rider}
          onChange={(val) => handleFilterChange("rider", val)}
          options={["all", "active", "inactive"]}
        />
        <FilterDropdown
          label="Order Status"
          value={filters.order}
          onChange={(val) => handleFilterChange("order", val)}
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
          value={filters.payment}
          onChange={(val) => handleFilterChange("payment", val)}
          options={["all", "COD", "Online"]}
        />
        <FilterDropdown
          label="Sort By"
          value={filters.sort}
          onChange={(val) => handleFilterChange("sort", val)}
          options={["date", "amount", "distance"]}
        />
        <FilterDropdown
          label="Date"
          value={filters.date}
          onChange={(val) => handleFilterChange("date", val)}
          options={["all", "today", "last7days", "thisMonth", "Custom"]}
        />
      </div>

      {filters.date === "Custom" && (
        <div className="flex gap-5 md:gap-20 mt-10 flex-col md:flex-row">
          <DateInput
            label="Start Date"
            value={filters.startDate}
            onChange={(val) => handleFilterChange("startDate", val)}
            max={filters.endDate}
          />
          <DateInput
            label="End Date"
            value={filters.endDate}
            onChange={(val) => handleFilterChange("endDate", val)}
            min={filters.startDate}
          />
        </div>
      )}

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
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />

        <div className="grid grid-cols-1 gap-5 mt-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <RiderOrderCard key={order._id} order={order} />
            ))
          ) : (
            <p className="text-gray-500 mt-4">No rider orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
