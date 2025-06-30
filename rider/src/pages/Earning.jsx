// Earning.jsx
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { GlobalContext } from "../contexts/GlobalContext";
import { toast } from "react-toastify";

const QuickDateButton = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1 border rounded ${
      selected ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
    }`}
  >
    {label}
  </button>
);

const Earning = () => {
  const { backendUrl, token } = useContext(GlobalContext);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedRange, setSelectedRange] = useState("Today");
  const [earnings, setEarnings] = useState(null);
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
  const [codCollected, setCodCollected] = useState(0);

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

  const fetchRangeEarning = async (start, end) => {
    try {
      const response = await axios.get(`${backendUrl}/api/rider/earning`, {
        headers: { token },
        params: { startDate: start, endDate: end },
      });
      return response.data.success ? response.data.totalEarnings : 0;
    } catch (error) {
      return 0;
    }
  };

  const fetchComparativeEarnings = async () => {
    const today = new Date();

    // Week
    const currWeekStart = new Date(today);
    currWeekStart.setDate(today.getDate() - today.getDay());
    const lastWeekStart = new Date(currWeekStart);
    lastWeekStart.setDate(currWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(currWeekStart);
    lastWeekEnd.setDate(currWeekStart.getDate() - 1);

    const currWeek = await fetchRangeEarning(
      currWeekStart.toISOString().split("T")[0],
      today.toISOString().split("T")[0]
    );
    const prevWeek = await fetchRangeEarning(
      lastWeekStart.toISOString().split("T")[0],
      lastWeekEnd.toISOString().split("T")[0]
    );
    setWeeklyEarnings({ current: currWeek, previous: prevWeek });

    // Month
    const currMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const currMonth = await fetchRangeEarning(
      currMonthStart.toISOString().split("T")[0],
      today.toISOString().split("T")[0]
    );
    const prevMonth = await fetchRangeEarning(
      lastMonthStart.toISOString().split("T")[0],
      lastMonthEnd.toISOString().split("T")[0]
    );
    setMonthlyEarnings({ current: currMonth, previous: prevMonth });

    // Year
    const currYearStart = new Date(today.getFullYear(), 0, 1);
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);

    const currYear = await fetchRangeEarning(
      currYearStart.toISOString().split("T")[0],
      today.toISOString().split("T")[0]
    );
    const prevYear = await fetchRangeEarning(
      lastYearStart.toISOString().split("T")[0],
      lastYearEnd.toISOString().split("T")[0]
    );
    setYearlyEarnings({ current: currYear, previous: prevYear });
  };

  const getChange = (curr, prev) => {
    if (prev === 0) return curr === 0 ? 0 : 100;
    return (((curr - prev) / prev) * 100).toFixed(1);
  };

  const fetchEarnings = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/rider/earning`, {
        headers: { token },
        params: { startDate, endDate },
      });

      if (response.data.success) {
        setEarnings(response.data.totalEarnings);
        
      } else {
        setEarnings(null);
        toast.error(response.data.message || "Failed to fetch earnings");
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error("Error fetching earnings");
    }
  };

  useEffect(() => {
    if (token) {
      fetchEarnings();
      fetchComparativeEarnings();
    }
  }, [startDate, endDate, token]);

  return (
    <div className="p-5">
 
     <h1 className="text-2xl font-bold mb-4"> Rider Earnings</h1>
      {/* Date Range Selector */}
      <div className="flex flex-col gap-4 mb-5 px-4 py-4 rounded-lg md:flex-row md:justify-between md:items-center bg-gray-100 shadow-md">
        
        <div className="flex flex-wrap gap-3">
          <QuickDateButton
            label="Today"
            selected={selectedRange === "Today"}
            onClick={() => setStartDateToPastDays(0, "Today")}
          />
          <QuickDateButton
            label="7D"
            selected={selectedRange === "7D"}
            onClick={() => setStartDateToPastDays(7, "7D")}
          />
          <QuickDateButton
            label="1M"
            selected={selectedRange === "1M"}
            onClick={() => setStartDateToPastDays(30, "1M")}
          />
          <QuickDateButton
            label="3M"
            selected={selectedRange === "3M"}
            onClick={() => setStartDateToPastDays(90, "3M")}
          />
          <QuickDateButton
            label="6M"
            selected={selectedRange === "6M"}
            onClick={() => setStartDateToPastDays(180, "6M")}
          />
          <QuickDateButton
            label="1Y"
            selected={selectedRange === "1Y"}
            onClick={() => setStartDateToPastDays(365, "1Y")}
          />
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

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-white shadow-md rounded-lg p-5 text-center border border-blue-200">
          <p className="text-sm text-gray-500">This Week</p>
          <p className="text-2xl font-bold text-blue-700">
            ₹{weeklyEarnings.current}
          </p>
          <p className="text-xs text-green-600">
            {getChange(weeklyEarnings.current, weeklyEarnings.previous)}% vs
            last week
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-5 text-center border border-green-200">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-2xl font-bold text-green-700">
            ₹{monthlyEarnings.current}
          </p>
          <p className="text-xs text-green-600">
            {getChange(monthlyEarnings.current, monthlyEarnings.previous)}% vs
            last month
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-5 text-center border border-purple-200">
          <p className="text-sm text-gray-500">This Year</p>
          <p className="text-2xl font-bold text-purple-700">
            ₹{yearlyEarnings.current}
          </p>
          <p className="text-xs text-green-600">
            {getChange(yearlyEarnings.current, yearlyEarnings.previous)}% vs
            last year
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-5 text-center border border-gray-200 col-span-1 md:col-span-3">
          <div className="mt-4 text-center text-gray-600">
            <p>
              📅 Selected Range:{" "}
              <span className="font-medium">
                {selectedRange || `${startDate} to ${endDate}`}
              </span>
            </p>
           
          </div>
          <div className="bg-white shadow-md rounded-lg p-5 text-center border border-purple-200 mt-8">
            <p className="text-sm text-gray-500">
              {" "}
              last {selectedRange || `${startDate} to ${endDate}`}
            </p>
            <p className="text-2xl font-bold text-purple-700">
              ₹{earnings !== null ? earnings : "Loading..."}
            </p>
            <p className="text-xs text-green-600">
              {earnings !== null
                ? getChange(earnings, 0) + "%"
                : "Calculating..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earning;
