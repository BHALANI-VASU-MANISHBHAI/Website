import axios from "axios";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { backendUrl } from "../App.jsx";
import assets from "../assets/assets.js";
import RoundedChart from "../components/RoundedChart.jsx";
import { OrderContext } from "../contexts/OrderContext.jsx";
import { ProductContext } from "../contexts/ProductContext.jsx";
import socket from "../services/socket.jsx";

// Memoized components moved outside to prevent unnecessary re-renders
const DashboardCard = React.memo(({ title, value }) => (
  <div className="flex flex-col gap-3 bg-white p-5 rounded-lg shadow-md w-full sm:w-[90%] md:w-[30%]">
    <div className="flex gap-5 items-center justify-between">
      <p className="text-gray-700 font-medium text-sm sm:text-base">{title}</p>
      <img src={assets.add_icon} className="w-4 h-4 sm:w-5 sm:h-5" alt="" />
    </div>
    <p className="text-lg sm:text-xl font-bold">{value}</p>
  </div>
));

const PopularProductCard = React.memo(({ item }) => (
  <div className="flex items-center gap-4 border-b pb-3 mb-3">
    <img
      src={item.image[0] || assets.add_icon}
      alt={item.name}
      className="w-16 h-16 object-cover rounded"
    />
    <div>
      <p className="font-medium">{item.name}</p>
      <p className="text-sm text-gray-500">{item.category}</p>
      <p className="text-sm text-gray-500">Sold: {item.quantity}</p>
    </div>
  </div>
));

const StockHeader = React.memo(() => (
  <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] bg-gray-100 items-center py-1 px-2 border text-sm">
    <b>Image</b>
    <b>Name</b>
    <b>Category (SubCategory)</b>
    <b className="ml-5">Stock</b>
    <b className="text-center">Action</b>
  </div>
));

const StockItem = React.memo(({ item, selectedStockType, navigate }) => (
  <div className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-2 py-1 px-2 border text-sm items-center">
    <img className="w-20" src={item.image[0]} alt="" />
    <p>{item.name}</p>
    <p>
      {item.category} ({item.subCategory})
    </p>
    <p
      className={`w-3/4 text-center ${
        selectedStockType === "out" ? "text-red-600" : "text-orange-500"
      }`}
    >
      {selectedStockType === "out" ? "Out of Stock" : "Low Stock"}
    </p>
    <p
      onClick={() => navigate(`/edit/${item._id}`)}
      className="bg-gray-500 text-white px-1 py-1 rounded-md text-center md:mx-auto cursor-pointer hover:bg-gray-700
        transition duration-200 ease-in-out hover:scale-105 md:w-24 sm:w-20 sm:text-xs text-xs flex items-center justify-center"
    >
      Edit
    </p>
  </div>
));

const QuickDateButton = React.memo(({ label, onClick, selected }) => (
  <button
    className={`px-3 py-1 rounded cursor-pointer ${
      selected ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
    }`}
    onClick={onClick}
  >
    {label}
  </button>
));

const Dashboard = ({ token }) => {
  const { products } = useContext(ProductContext);
  const { orders } = useContext(OrderContext);
  const navigate = useNavigate();

  // State management
  const [dashboardData, setDashboardData] = useState({
    mostSellerToday: null,
    lowStock: [],
    outOfStock: [],
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    cost: 0,
    profit: 0,
    deliveryProfit: 0,
    deliveredCost: 0,
    loading: true,
  });

  const [filters, setFilters] = useState({
    selectedStockType: "out",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    selectedRange: null,
  });

  // Memoized derived values
  const RoundedChartData = useMemo(
    () => [
      { name: "Profit", value: dashboardData.profit, color: "#4CAF50" },
      {
        name: "Rider Profit",
        value: dashboardData.deliveryProfit,
        color: "#2196F3",
      },
      { name: "Cost", value: dashboardData.cost, color: "#FF9800" },
      {
        name: "Rider Cost",
        value: dashboardData.deliveredCost,
        color: "#9C27B0",
      },
    ],
    [dashboardData]
  );

  const displayedProducts = useMemo(
    () =>
      filters.selectedStockType === "out"
        ? dashboardData.outOfStock
        : dashboardData.lowStock,
    [
      filters.selectedStockType,
      dashboardData.outOfStock,
      dashboardData.lowStock,
    ]
  );

  // API calls
  const getLowStocksProduct = useCallback(async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/product/getLowStock`,
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        const allLowStocks = response.data.products;
        setDashboardData((prev) => ({
          ...prev,
          outOfStock: allLowStocks.filter((pro) =>
            pro.stock.some((s) => s.quantity === 0)
          ),
          lowStock: allLowStocks.filter((pro) =>
            pro.stock.some((s) => s.quantity > 0 && s.quantity <= 5)
          ),
        }));
      } else {
        toast.error("Failed to fetch low stock products");
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, [token]);

  const GetMostSellerByRanges = useCallback(async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/dashboard/getMostSellingProductsByRange?startDate=${filters.startDate}&endDate=${filters.endDate}`,
        { headers: { token } }
      );
      if (response.data.success) {
        setDashboardData((prev) => ({
          ...prev,
          mostSellerToday: response.data.mostSellingProducts,
        }));
      } else {
        toast.error("Failed to fetch most seller products by range");
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, [filters.startDate, filters.endDate, token]);

  const TotalCustomers = useCallback(async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/dashboard/totalCustomers`,
        {
          headers: { token },
        }
      );
      if (res.data.success) {
        setDashboardData((prev) => ({
          ...prev,
          totalCustomers: res.data.totalCustomers,
        }));
      } else {
        toast.error("Failed to fetch total customers");
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, [token]);

  // Data processing
  const calculateStatsFromOrders = useCallback(() => {
    if (!orders || orders.length === 0) {
      setDashboardData((prev) => ({ ...prev, loading: false }));
      return;
    }

    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const stats = orders.reduce(
      (acc, order) => {
        const date = new Date(order.createdAt);
        if (date >= start && date <= end) {
          acc.totalOrders++;

          if (order.status === "Delivered") {
            const orderStats = order.items.reduce(
              (itemAcc, item) => {
                itemAcc.revenue += item.price * item.quantity;
                itemAcc.cost += (item.originalPrice || 0) * item.quantity;
                return itemAcc;
              },
              { revenue: 0, cost: 0 }
            );

            acc.totalRevenue += orderStats.revenue;
            acc.cost += orderStats.cost;
            acc.deliveryProfit +=
              (order.deliveryCharge || 0) - (order.earning?.amount || 0);
            acc.deliveredCost += order.earning?.amount || 0;
          }
        }
        return acc;
      },
      {
        totalRevenue: 0,
        totalOrders: 0,
        cost: 0,
        deliveryProfit: 0,
        deliveredCost: 0,
        profit: 0,
      }
    );

    // Calculate profit
    stats.profit =
      stats.totalRevenue -
      stats.cost -
      (stats.deliveredCost - stats.deliveryProfit);

    setDashboardData((prev) => ({
      ...prev,
      ...stats,
      loading: false,
    }));
  }, [orders, filters.startDate, filters.endDate]);

  // Combined data fetching
  const fetchAllDashboardData = useCallback(async () => {
    try {
      setDashboardData((prev) => ({ ...prev, loading: true }));

      await Promise.all([GetMostSellerByRanges(), TotalCustomers()]);

      calculateStatsFromOrders();
    } catch (err) {
      toast.error(err.message);
      setDashboardData((prev) => ({ ...prev, loading: false }));
    }
  }, [GetMostSellerByRanges, TotalCustomers, calculateStatsFromOrders]);

  // Date range helpers
  const setStartDateToPastDays = useCallback((days, label) => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - days);

    setFilters((prev) => ({
      ...prev,
      startDate: past.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      selectedRange: label,
    }));
  }, []);

  // Effects
  useEffect(() => {
    getLowStocksProduct();
    TotalCustomers();
  }, [getLowStocksProduct, TotalCustomers]);

  useEffect(() => {
    if (orders && orders.length > 0) {
      fetchAllDashboardData();
    } else {
      setDashboardData((prev) => ({ ...prev, loading: false }));
    }
  }, [filters.startDate, filters.endDate, fetchAllDashboardData, orders]);

  useEffect(() => {
    const handleUpdate = () => fetchAllDashboardData();
    const handleCustomerAdded = () => TotalCustomers();

    socket.on("orderPlaced", handleUpdate);
    socket.on("orderCancelled", handleUpdate);
    socket.on("customerAdded", handleCustomerAdded);

    return () => {
      socket.off("orderPlaced", handleUpdate);
      socket.off("orderCancelled", handleUpdate);
      socket.off("customerAdded", handleCustomerAdded);
    };
  }, [fetchAllDashboardData, TotalCustomers]);

  if (dashboardData.loading)
    return <p className="text-center mt-10">Loading dashboard...</p>;
  
  return (
    <div className="p-5">
      {/* Date Picker */}
      <div className="flex flex-col gap-4 mb-5 px-4 py-4 rounded-lg md:flex-row md:justify-between md:items-center bg-gray-100 shadow-md">
        <div className="flex flex-wrap gap-4">
          {["Today", "7D", "1M", "3M", "6M", "1Y"].map((label, i) => (
            <QuickDateButton
              key={label}
              label={label}
              selected={filters.selectedRange === label}
              onClick={() =>
                setStartDateToPastDays([0, 7, 30, 90, 180, 365][i], label)
              }
            />
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <p>Start Date</p>
          <input
            type="date"
            value={filters.startDate}
            max={filters.endDate}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                startDate: e.target.value,
                selectedRange: null,
              }));
            }}
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>
        <div className="flex gap-4 items-center">
          <p>End Date</p>
          <input
            type="date"
            value={filters.endDate}
            min={filters.startDate}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                endDate: e.target.value,
                selectedRange: null,
              }));
            }}
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-row gap-7">
        <div className="flex md:gap-10 sm:gap-3 w-full flex-col md:flex-row gap-8">
          <DashboardCard
            title="Total Revenue"
            value={`₹${dashboardData.totalRevenue.toFixed(2)}`}
          />
          <DashboardCard
            title="Total Orders"
            value={`${dashboardData.totalOrders} Orders`}
          />
          <DashboardCard
            title="Total Customers"
            value={`${dashboardData.totalCustomers} Customers`}
          />
        </div>
      </div>

      {/* Chart & Most Seller */}
      <div className="flex flex-col lg:flex-row justify-between gap-5 w-full mt-10 md:flex-col">
        <div className="w-full lg:w-[60%] md:w-full">
          <RoundedChart data={RoundedChartData} />
        </div>
        <div className="w-full lg:w-[35%] mt-10 md:mt-0 bg-white p-5 rounded-lg shadow-md">
          <h1 className="text-lg font-bold mb-4">Popular Products</h1>
          {dashboardData.mostSellerToday?.length ? (
            dashboardData.mostSellerToday.map((item, i) => (
              <PopularProductCard key={i} item={item} />
            ))
          ) : (
            <p className="text-gray-500">No Popular Product Found</p>
          )}
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="mt-10">
        <div className="flex gap-10 bg-gray-300 h-12 justify-between items-center px-4">
          <p className="text-[10px] sm:text-md md:text-xl font-bold">
            {filters.selectedStockType === "out"
              ? "Out of Stock Alerts"
              : "Low Stock Alerts"}
          </p>
          <select
            value={filters.selectedStockType}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                selectedStockType: e.target.value,
              }))
            }
            className="text-sm px-2 py-1 bg-gray-100"
          >
            <option value="out">Out of Stock</option>
            <option value="low">Low Stock</option>
          </select>
        </div>
        {displayedProducts.length > 0 ? (
          <div className="flex flex-col gap-2 mt-3">
            <StockHeader />
            {displayedProducts.map((item, index) => (
              <StockItem
                key={index}
                item={item}
                selectedStockType={filters.selectedStockType}
                navigate={navigate}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-2">
            No{" "}
            {filters.selectedStockType === "out" ? "Out of Stock" : "Low Stock"}{" "}
            Products
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
