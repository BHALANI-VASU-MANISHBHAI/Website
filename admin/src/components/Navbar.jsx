import React, { useState, useContext } from "react";
import assets from "../assets/assets.js";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [Sidebar, setSidebar] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("retryCounts");
    
    window.location.reload();
  };

  const navItems = [
    {
      label: "Add Items",
      icon: assets.add_icon,
      to: "/add",
    },
    {
      label: "List Items",
      icon: assets.order_icon,
      to: "/list",
    },
    {
      label: "Orders",
      icon: assets.order_icon,
      to: "/orders",
    },
    {
      label: "Dashboard",
      icon: assets.order_icon,
      to: "/dashboard",
    },
    {
      label: "Rider Dashboard",
      icon: assets.order_icon,
      to: "/rider-dashboard",
    },
    {
      label: "Rider COD Info",
      icon: assets.order_icon,
      to: "/rider-cod-info",
    }
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="flex items-center py-2 px-[2%] md:justify-between justify-evenly">
        <div className="mr-5 md:hidden">
          <img
            onClick={() => setSidebar(!Sidebar)}
            src={assets.side_menu_icon}
            alt="menu"
            className="h-7 w-7 cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-2 md:gap-4 w-full justify-between">
          <img className="w-25 md:w-35" src={assets.logo} alt="logo" />
          <div className="hidden md:flex items-center gap-10">
            <button
              className="bg-gray-700 text-white px-5 py-2 rounded-full text-xs sm:text-sm cursor-pointer hover:bg-gray-800"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Drawer */}
      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 left-0 w-[100%] sm:w-[300px] h-full z-50 bg-white transform transition-transform duration-500 ease-in-out ${
          Sidebar ? "translate-x-0" : "-translate-x-full"
        } shadow-lg border-r`}
      >
        {/* Header with Close button */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button onClick={() => setSidebar(false)}>
            <img src={assets.cross_icon} alt="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-2 px-4 pt-4 text-[15px]">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.to}
              onClick={() => setSidebar(false)}
              className="flex items-center gap-3 border border-gray-200 hover:bg-gray-100 px-4 py-2 rounded transition"
            >
              <img className="w-5 h-5" src={item.icon} alt={item.label} />
              <p className="font-medium">{item.label}</p>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
