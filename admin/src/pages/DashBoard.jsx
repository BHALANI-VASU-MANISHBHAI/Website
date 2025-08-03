import axios from "axios";
import React, {
  use,
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
import PopularProductCard from "../components/PopularProductCard.jsx";
import DashboardCard from "../components/DashboardCard.jsx";
import StockItem from "../components/StockItem.jsx";
import WeeklyStatsChart from "../components/WeeklyStatsChart.jsx";
const StockHeader = React.memo(() => (
  <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] bg-gray-100 items-center py-1 px-2 border text-sm">
    <b>Image</b>
    <b>Name</b>
    <b>Category (SubCategory)</b>
    <b className="ml-5">Stock</b>
    <b className="text-center">Action</b>
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
  const [tab, setTab] = useState("weekly-stats");
  const [year, setYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0] // Today's date
  );
  const [monthlyStats, setMonthlyStats] = useState([]);
  const getMostRecentMonday = (startDate) => {
    const date = new Date(startDate || new Date());
    const day = date.getDay();
    const diff = (day + 6) % 7; // Calculate difference to last Monday
    date.setDate(date.getDate() - diff);
    return date.toISOString().split("T")[0]; // Return in YYYY-MM-DD format
  };

  const [monthlyData, setMonthlyData] = useState([]);
  const [startDate, setStartDate] = useState(getMostRecentMonday());
  const getMonthlyStats = useCallback(async () => {
    try {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0); // Last day of the month
      const response = await axios.get(
        `${backendUrl}/api/dashboard/getDataByDateRange?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { token },
        }
      );
      console.log("Monthly stats response:", response.data);
      if (response.data.success) {
        console.log("Monthly stats data:", response.data.data);
        setMonthlyStats(response.data.data);
      } else {
        toast.error("Failed to fetch monthly stats");
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, [startDate, endDate, token]);

  useEffect(() => {
    getMonthlyStats();
  }, [getMonthlyStats, month, year]);

  const getStatsData = useCallback(async (startDate, endDate) => {
    try {
      console.log("Fetching stats data...");

      const res = await axios.get(
        `http://localhost:10000/api/dashboard/getDataByDateRange`,
        {
          params: { startDate, endDate },
        }
      );

      if (res.data.success) {
        setStats(res.data.data);
      } else {
        console.warn("No stats data returned");
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    getStatsData(getMostRecentMonday(startDate), endDate);
  }, [getStatsData, month, startDate, endDate]);

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
  const [weeklyStats, setWeeklyStats] = useState({
    Profit: 0,
    RiderProfit: 0,
    Cost: 0,
    RiderCost: 0,
  });

  // Effects
  useEffect(() => {
    getLowStocksProduct();
    TotalCustomers();
  }, [getLowStocksProduct, TotalCustomers]);
  const getWeeklyStats = () => {
    const weeklyStats = stats.reduce(
      (acc, stat) => {
        acc.Profit += stat.Profit;
        acc.RiderProfit += stat.RiderProfit;
        acc.Cost += stat.Cost;
        acc.RiderCost += stat.RiderCost;
        return acc;
      },
      { Profit: 0, RiderProfit: 0, Cost: 0, RiderCost: 0 }
    );
    setWeeklyStats(weeklyStats);
  };

  const getMonthlyStatsData = () => {
    if (!stats || stats.length === 0) {
      setMonthlyData({
        Profit: 0,
        RiderProfit: 0,
        Cost: 0,
        RiderCost: 0,
      });
      return;
    }
    console.log("Calculating monthly stats.,..", monthlyStats);
    const monthlyStatss = monthlyStats.reduce(
      (acc, stat) => {
        acc.Profit += stat.Profit;
        acc.RiderProfit += stat.RiderProfit;
        acc.Cost += stat.Cost;
        acc.RiderCost += stat.RiderCost;
        return acc;
      },
      { Profit: 0, RiderProfit: 0, Cost: 0, RiderCost: 0 }
    );
    setMonthlyData(monthlyStatss);

    console.log("Monthly Stats:", monthlyStatss);
  };

  useEffect(() => {
    getMonthlyStatsData();
  }, [month, year]);

  useEffect(() => {
    getWeeklyStats();
  }, [stats]);

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

    socket.on("order:placed", handleUpdate);
    socket.on("order:cancelled", handleUpdate);
    socket.on("customerAdded", handleCustomerAdded);

    return () => {
      socket.off("order:placed", handleUpdate);
      socket.off("order:cancelled", handleUpdate);
      socket.off("customerAdded", handleCustomerAdded);
    };
  }, [fetchAllDashboardData, TotalCustomers]);

  if (dashboardData.loading)
    return <p className="text-center mt-10">Loading dashboard...</p>;

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <ul className="flex gap-4">
          <li
            className={`cursor-pointer ${
              tab === "overview"
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setTab("overview")}
          >
            Overview
          </li>
          <li
            className={`cursor-pointer ${
              tab === "weekly-stats"
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setTab("weekly-stats")}
          >
            Weekly Stats
          </li>
        </ul>
      </div>
      {tab === "overview" && (
        <>
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
                {filters.selectedStockType === "out"
                  ? "Out of Stock"
                  : "Low Stock"}{" "}
                Products
              </p>
            )}
          </div>
        </>
      )}
      {tab === "weekly-stats" && (
        <>
          <div className="mt-10 relative w-full">
            <select
              name="month"
              id="month"
              className="mb-5"
              value={month}
              onChange={(e) => {
                const selectedMonth = parseInt(e.target.value); // Get selected month from event
                setMonth(selectedMonth);

                const start = new Date(year, selectedMonth - 1, 1); // First day of the selected month
                // after wek days + 6 ???? start+6 ??????
                const end = new Date(start); // clone the start date
                end.setDate(end.getDate() + 6); // add 6 days

                setStartDate(start.toISOString().split("T")[0]);
                setEndDate(end.toISOString().split("T")[0]);
              }}
            >
              {[...Array(12).keys()].map((m) => (
                <option key={m} value={m + 1}>
                  {new Date(0, m).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>

            <WeeklyStatsChart
              data={stats}
              startDate={startDate}
              endDate={endDate}
            />
            <div className="flex justify-between mt-5 absolute top-0 right-0">
              <button
                onClick={() => {
                  const start = new Date(startDate);
                  const end = new Date(endDate);
                  start.setDate(start.getDate() - 7);
                  end.setDate(end.getDate() - 7);
                  setStartDate(start.toISOString().split("T")[0]);
                  setEndDate(end.toISOString().split("T")[0]);
                }}
                className=" px-2 py-2  text-white rounded
             m-4"
              >
                <img
                  src={assets.dropdown_icon}
                  alt="Previous Week"
                  className="w-4 h-4 inline-block mr-2 rotate-180 cursor-pointer"
                />
              </button>
              <button
                onClick={() => {
                  const start = new Date(startDate);
                  const end = new Date(endDate);
                  start.setDate(start.getDate() + 7);
                  end.setDate(end.getDate() + 7);
                  setStartDate(start.toISOString().split("T")[0]);
                  setEndDate(end.toISOString().split("T")[0]);
                }}
                className="mt-5 px-2 py-2 rounded text-white 
             m-4"
              >
                <img
                  src={assets.dropdown_icon}
                  alt="Next Week"
                  className="w-4 h-4 inline-block mr-2 cursor-pointer"
                />
              </button>
            </div>
          </div>
          <div>
            {weeklyStats && (
              <div className="mt-10 space-y-6">
                {/* Weekly Stats Card */}
                <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
                  <h2 className="text-xl font-bold">
                    Weekly Stats from {startDate} to {endDate}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {weeklyStats.Profit > 0 && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-lg font-semibold">
                          Total Profit: ₹{weeklyStats.Profit.toFixed(2)}
                        </p>
                      </div>
                    )}

                    {weeklyStats.RiderProfit > 0 && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-lg font-semibold">
                          Total Rider Profit: ₹
                          {weeklyStats.RiderProfit.toFixed(2)}
                        </p>
                      </div>
                    )}

                    {weeklyStats.Cost > 0 && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-lg font-semibold">
                          Total Cost: ₹{weeklyStats.Cost.toFixed(2)}
                        </p>
                      </div>
                    )}

                    {weeklyStats.RiderCost > 0 && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-lg font-semibold">
                          Total Rider Cost: ₹{weeklyStats.RiderCost.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                  {weeklyStats.Profit == 0 && weeklyStats.Cost == 0 ? (
                    <p className="text-gray-500 mt-2">
                      No stats available for {startDate} to {endDate}.
                    </p>
                  ) : null}
                </div>

                {/* Monthly Stats Card */}
                <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
                  <h2 className="text-xl font-bold mb-2">
                    Monthly Stats for{" "}
                    {new Date(year, month - 1).toLocaleString("default", {
                      month: "long",
                    })}{" "}
                    {year}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {monthlyData.Profit > 0 && (
                      <>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-lg font-semibold">
                            Total Profit: ₹{monthlyData.Profit?.toFixed(2) || 0}
                          </p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-lg font-semibold">
                            Total Rider Profit: ₹
                            {monthlyData.RiderProfit?.toFixed(2) || 0}
                          </p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-lg font-semibold">
                            Total Cost: ₹{monthlyData.Cost?.toFixed(2) || 0}
                          </p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-lg font-semibold">
                            Total Rider Cost: ₹
                            {monthlyData.RiderCost?.toFixed(2) || 0}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {monthlyData.Profit == 0 && monthlyData.Cost == 0 ? (
                    <p className="text-gray-500 mt-2">
                      No stats available for this month.
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
