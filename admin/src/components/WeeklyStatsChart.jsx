import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Sample format expected from props
// [
//   { day: "Mon", Profit: 1000, RiderProfit: 500, Cost: 300, RiderCost: 200 },
//   { day: "Tue", Profit: 1200, RiderProfit: 600, Cost: 400, RiderCost: 250 },
//   ...
// ]

const WeeklyStatsChart = ({ data, startDate, endDate }) => {
    if (!data || data.length === 0) {
    return (
      <div className="w-full h-[500px] bg-white p-4 rounded-xl shadow-md flex items-center justify-center">
        <p className="text-gray-500">No data available for the selected range {startDate} to {endDate}.</p>
      </div>
        );
    }
  return (
    <div className="w-full h-[500px] bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-center text-lg font-semibold text-gray-700 mb-2">
        Weekly Financial Overview ({startDate} to {endDate})
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Profit" fill="#4CAF50" />
          <Bar dataKey="RiderProfit" fill="#2196F3" />
          <Bar dataKey="Cost" fill="#FF9800" />
          <Bar dataKey="RiderCost" fill="#9C27B0" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyStatsChart;
