import assets from "../assets/assets.js";
import StockItem from "./StockItem.jsx";
import React from "react";
// StockFilterSelect.jsx
const StockFilterSelect = ({ selectedStockType, setSelectedStockType }) => (
  <select
    value={selectedStockType}
    onChange={(e) => setSelectedStockType(e.target.value)}
    className="text-sm px-2 py-1 bg-gray-100"
  >
    <option value="out">Out of Stock</option>
    <option value="low">Low Stock</option>
  </select>
);
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

const StockHeader = () => (
  <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] bg-gray-100 items-center py-1 px-2 border text-sm">
    <b>Image</b>
    <b>Name</b>
    <b>Category (SubCategory)</b>
    <b className="ml-5">Stock</b>
    <b className="text-center">Action</b>
  </div>
);

// StockList.jsx
const StockList = ({ displayedProducts, selectedStockType, navigate }) =>
  displayedProducts.length > 0 ? (
    <div className="flex flex-col gap-2 mt-3">
      <StockHeader />
      {displayedProducts.map((item, index) => (
        <StockItem
          key={index}
          item={item}
          selectedStockType={selectedStockType}
          navigate={navigate}
        />
      ))}
    </div>
  ) : (
    <p className="text-gray-500 mt-2">
      No {selectedStockType === "out" ? "Out of Stock" : "Low Stock"} Products
    </p>
  );

// WeeklyStatsControls.jsx
const WeeklyStatsControls = ({
  month,
  setMonth,
  year,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => (
  <div className="mt-10 relative w-full">
    <select
      name="month"
      id="month"
      className="mb-5"
      value={month}
      onChange={(e) => {
        const selectedMonth = parseInt(e.target.value);
        setMonth(selectedMonth);
        const start = new Date(year, selectedMonth - 1, 1);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
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
        className="px-2 py-2 text-white rounded m-4"
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
        className="mt-5 px-2 py-2 rounded text-white m-4"
      >
        <img
          src={assets.dropdown_icon}
          alt="Next Week"
          className="w-4 h-4 inline-block mr-2 cursor-pointer"
        />
      </button>
    </div>
  </div>
);

// WeeklyStatsCard.jsx
const WeeklyStatsCard = ({ weeklyStats, startDate, endDate }) => (
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
            Total Rider Profit: ₹{weeklyStats.RiderProfit.toFixed(2)}
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

    {weeklyStats.Profit === 0 && weeklyStats.Cost === 0 && (
      <p className="text-gray-500 mt-2">
        No stats available for {startDate} to {endDate}.
      </p>
    )}
  </div>
);

// MonthlyStatsCard.jsx
const MonthlyStatsCard = ({ monthlyData, month, year }) => (
  <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
    <h2 className="text-xl font-bold mb-2">
      Monthly Stats for{" "}
      {new Date(year, month - 1).toLocaleString("default", { month: "long" })}{" "}
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
              Total Rider Profit: ₹{monthlyData.RiderProfit?.toFixed(2) || 0}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-lg font-semibold">
              Total Cost: ₹{monthlyData.Cost?.toFixed(2) || 0}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-lg font-semibold">
              Total Rider Cost: ₹{monthlyData.RiderCost?.toFixed(2) || 0}
            </p>
          </div>
        </>
      )}
    </div>

    {monthlyData.Profit === 0 && monthlyData.Cost === 0 && (
      <p className="text-gray-500 mt-2">No stats available for this month.</p>
    )}
  </div>
);

const TopFilter = ({ label, selected, onClick, filters, setFilters,setStartDateToPastDays }) => (
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
);

export {
  StockFilterSelect,
  StockList,
  WeeklyStatsControls,
  WeeklyStatsCard,
  MonthlyStatsCard,
  StockHeader,
  StockItem,
  TopFilter,
};
