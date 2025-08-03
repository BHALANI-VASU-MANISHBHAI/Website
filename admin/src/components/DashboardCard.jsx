import React from "react";
import assets from "../assets/assets.js";
const DashboardCard = ({ title, value }) => {
  return (
    <div className="flex flex-col gap-3 bg-white p-5 rounded-lg shadow-md w-full sm:w-[90%] md:w-[30%]">
      <div className="flex gap-5 items-center justify-between">
        <p className="text-gray-700 font-medium text-sm sm:text-base">
          {title}
        </p>
        <img src={assets.add_icon} className="w-4 h-4 sm:w-5 sm:h-5" alt="" />
      </div>
      <p className="text-lg sm:text-xl font-bold">{value}</p>
    </div>
  );
};

export default React.memo(DashboardCard);
