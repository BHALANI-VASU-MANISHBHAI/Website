import React from "react";

const StatCard = React.memo(({ title, value, color }) => {
  const colorMap = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    gray: "bg-gray-100 text-gray-700",
    indigo: "bg-indigo-100 text-indigo-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <div
      className={`p-5 rounded-md shadow-md ${
        colorMap[color] || "bg-gray-100 text-gray-700"
      }`}
    >
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
});

export default StatCard;
