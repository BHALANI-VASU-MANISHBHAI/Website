import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import assets from "../assets/assets.js";

const SidebarAnimation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[18%] bg-white border-r-2 transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-4 pt-6 pl-[10%] text-[15px]">
          <div className="mr-auto flex flex-col items-center gap-2  ml-1 justify-center">
            <img src={assets.cross_icon} alt="" />
          </div>
          <NavLink
            className="flex items-center gap-3 border border-gray-300 px-2 py-1 rounded"
            to="/add"
          >
            <img className="w-5 h-5" src={assets.add_icon} alt="" />
            <p>Add Items</p>
          </NavLink>
          <NavLink
            className="flex items-center gap-3 border border-gray-300 px-2 py-1 rounded"
            to="/list"
          >
            <img className="w-5 h-5" src={assets.order_icon} alt="" />
            <p>List Items</p>
          </NavLink>
          <NavLink
            className="flex items-center gap-3 border border-gray-300 px-2 py-1 rounded"
            to="/orders"
          >
            <img className="w-5 h-5" src={assets.order_icon} alt="" />
            <p>Orders</p>
          </NavLink>
          <NavLink
            className="flex items-center gap-3 border border-gray-300 px-2 py-1 rounded"
            to="/dashboard"
          >
            <img className="w-5 h-5" src={assets.dashboard_icon} alt="" />
            <p>Dashboard</p>
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default SidebarAnimation;
