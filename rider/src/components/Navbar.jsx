import React, { useContext, useState } from "react";
import { GlobalContext } from "../contexts/GlobalContext";
import { UserContext } from "../contexts/UserContext";
import { Link, NavLink } from "react-router-dom";
import assets from "../assets/assets";

const Navbar = () => {
  const { token, backendUrl, navigate, setToken } = useContext(GlobalContext);
  const { userData, setUserData } = useContext(UserContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const LogOut = () => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/login");
    setUserData(null);
  };

  if (!token) {
    return (
      <div className="flex justify-between items-center px-6 py-3 bg-white shadow-md">
        <div className="text-xl font-bold text-blue-600">RiderPortal</div>
        <div className="flex gap-4 items-center">
          <Link
            to="/login"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-100 transition"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={`fixed z-50 top-0 left-0 w-64 h-full bg-white shadow-xl transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-blue-600">Menu</h2>
          <button
            className="text-lg font-bold text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-3 p-4">
          {[
            { label: "Dashboard", to: "/dashboard" },
            { label: "Orders", to: "/orders" },
            { label: "History", to: "/history" },
            { label: "Earnings", to: "/earnings" },
            { label: "Profile", to: "/profile" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-blue-50 text-gray-700 hover:text-blue-600"
              onClick={() => setSidebarOpen(false)}
            >
              <img src={assets.order_icon} alt="icon" className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Top Navbar */}
      <div className="flex justify-between items-center px-4 py-3 bg-white shadow-md sticky top-0 z-40">
        {/* Sidebar Toggle (Mobile) */}
        <div className="flex items-center gap-3">
          <img
            src={assets.side_menu_icon}
            alt="Menu"
            className="w-8 h-8 cursor-pointer sm:hidden"
            onClick={() => setSidebarOpen(true)}
          />
          <div className="text-xl font-bold text-blue-600">RiderPortal</div>
        </div>

        {/* NavLinks (Desktop) */}
        <div className="hidden sm:flex gap-6">
          <NavLink to="/dashboard" className="hover:text-blue-600">
            Dashboard
          </NavLink>
          <NavLink to="/orders" className="hover:text-blue-600">
            Orders
          </NavLink>
          <NavLink to="/history" className="hover:text-blue-600">
            History
          </NavLink>
          <NavLink to="/earnings" className="hover:text-blue-600">
            Earnings
          </NavLink>
        </div>

        {/* Profile & Logout */}
        <div className="flex items-center gap-4">
          <img
            src={
              userData?.profilePhoto || `${backendUrl}/assets/default_profile.png`
            }
            alt="Profile"
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
          />
          <button
            className="text-sm px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={LogOut}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
