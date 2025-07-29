import { useContext, useEffect, useState } from "react";
import { OrderContext } from "../contexts/OrderContext";

const QuickDateButton = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full border text-sm transition-all duration-200 ${
      selected
        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
    }`}
  >
    {label}
  </button>
);

const Earning = () => {
  const { orderHistory } = useContext(OrderContext);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedRange, setSelectedRange] = useState("Today");
  const [earnings, setEarnings] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState({
    current: 0,
    previous: 0,
  });
  const [monthlyEarnings, setMonthlyEarnings] = useState({
    current: 0,
    previous: 0,
  });
  const [yearlyEarnings, setYearlyEarnings] = useState({
    current: 0,
    previous: 0,
  });
  const [todayEarnings, setTodayEarnings] = useState(0);

  const [loading, setLoading] = useState(true);

  const setStartDateToPastDays = (days, label) => {
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
    setSelectedRange(label);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate") setStartDate(value);
    else if (name === "endDate") setEndDate(value);
    setSelectedRange(null);
  };

  const calculateEarnings = (start, end) => {
    const startTime = new Date(start);
    startTime.setHours(0, 0, 0, 0);
    const endTime = new Date(end);
    endTime.setHours(23, 59, 59, 999);

    const filtered = orderHistory.filter((order) => {
      const accepted = new Date(order.acceptedTime);
      return (
        accepted >= startTime &&
        accepted <= endTime &&
        order.status === "Delivered" &&
        order.earning?.amount
      );
    });

    return filtered.reduce((sum, order) => sum + order.earning.amount, 0);
  };

  const updateEarnings = () => {
    const total = calculateEarnings(startDate, endDate);
    setEarnings(total);
  };

  const updateComparativeEarnings = () => {
    const today = new Date();

    const currWeekStart = new Date(today);
    currWeekStart.setDate(today.getDate() - today.getDay());

    const lastWeekStart = new Date(currWeekStart);
    lastWeekStart.setDate(currWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(currWeekStart);
    lastWeekEnd.setDate(currWeekStart.getDate() - 1);

    const currWeek = calculateEarnings(
      currWeekStart.toISOString().split("T")[0],
      today.toISOString().split("T")[0]
    );
    const prevWeek = calculateEarnings(
      lastWeekStart.toISOString().split("T")[0],
      lastWeekEnd.toISOString().split("T")[0]
    );
    setWeeklyEarnings({ current: currWeek, previous: prevWeek });

    const currMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const currMonth = calculateEarnings(
      currMonthStart.toISOString().split("T")[0],
      today.toISOString().split("T")[0]
    );
    const prevMonth = calculateEarnings(
      lastMonthStart.toISOString().split("T")[0],
      lastMonthEnd.toISOString().split("T")[0]
    );
    setMonthlyEarnings({ current: currMonth, previous: prevMonth });

    const currYearStart = new Date(today.getFullYear(), 0, 1);
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);

    const currYear = calculateEarnings(
      currYearStart.toISOString().split("T")[0],
      today.toISOString().split("T")[0]
    );
    const prevYear = calculateEarnings(
      lastYearStart.toISOString().split("T")[0],
      lastYearEnd.toISOString().split("T")[0]
    );
    setYearlyEarnings({ current: currYear, previous: prevYear });
  };

  const getChange = (curr, prev) => {
    if (prev === 0) return curr === 0 ? 0 : 100;
    return (((curr - prev) / prev) * 100).toFixed(1);
  };
  const updateTodayEarnings = () => {
    const today = new Date().toISOString().split("T")[0];
    const total = calculateEarnings(today, today);
    setTodayEarnings(total);
  };

  useEffect(() => {
    if (!orderHistory) return;
    updateEarnings();
    updateComparativeEarnings();
    updateTodayEarnings();
    setLoading(false);
  }, [startDate, endDate, orderHistory]);

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-600 font-medium">
        Loading earnings...
      </div>
    );
  }

  if (
    earnings === 0 &&
    weeklyEarnings.current === 0 &&
    monthlyEarnings.current === 0 &&
    yearlyEarnings.current === 0
  ) {
    return (
      <div className="text-center mt-20 text-gray-500 font-medium">
        No earnings data available
      </div>
    );
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Rider Earnings</h1>

      {/* Quick date range and manual date filters */}
      <div className="flex flex-col gap-4 mb-5 px-4 py-4 rounded-lg md:flex-row md:justify-between md:items-center bg-gray-100 shadow-md">
        <div className="flex flex-wrap gap-3">
          {[
            ["Today", 0],
            ["7D", 7],
            ["1M", 30],
            ["3M", 90],
            ["6M", 180],
            ["1Y", 365],
          ].map(([label, days]) => (
            <QuickDateButton
              key={label}
              label={label}
              selected={selectedRange === label}
              onClick={() => setStartDateToPastDays(days, label)}
            />
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <p>Start Date</p>
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={handleDateChange}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex gap-3 items-center">
          <p>End Date</p>
          <input
            type="date"
            name="endDate"
            value={endDate}
            onChange={handleDateChange}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Earnings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {[
          {
            label: "Today",
            color: "indigo",
            data: { current: todayEarnings, previous: 0 },
          },
          ,
          { label: "This Week", color: "blue", data: weeklyEarnings },
          { label: "This Month", color: "green", data: monthlyEarnings },
          { label: "This Year", color: "purple", data: yearlyEarnings },
        ].map(({ label, color, data }) => (
          <div
            key={label}
            className={`bg-white shadow-sm rounded-2xl p-6 text-center border border-${color}-100`}
          >
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-semibold text-${color}-700`}>
              ₹{data.current.toFixed(2)}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {getChange(data.current, data.previous)}% vs last period
            </p>
          </div>
        ))}
      </div>

      {/* Optional: Selected range earnings below */}
      <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 shadow-sm mt-8">
        <div className="text-gray-600 text-sm mb-2">
          Selected Range:
          <span className="font-medium ml-1">
            {selectedRange || `${startDate} to ${endDate}`}
          </span>
        </div>
        <div className="p-5 bg-gray-50 rounded-xl border border-purple-200">
          <p className="text-sm text-gray-500 mb-1">
            {selectedRange || `${startDate} to ${endDate}`}
          </p>
          <p className="text-2xl font-bold text-purple-700">
            ₹{earnings !== null ? earnings.toFixed(2) : "Loading..."}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {earnings !== null
              ? getChange(earnings, 0) + "%"
              : "Calculating..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Earning;
