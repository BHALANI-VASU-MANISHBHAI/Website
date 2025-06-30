import React from "react";
import assets from "../assets/assets.js";
import { NavLink } from "react-router-dom";
import { useContext } from "react";

const Navbar = () => {
  const [Sidebar, setSidebar] = React.useState(false);


  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <>
      <div className="flex items-center py-2 px-[2%]  md:justify-between  justify-evenly ">
        <div className="mr-5 md:hidden">
          <img
            onClick={() => {
              setSidebar(!Sidebar);
              console.log("Sidebar", Sidebar);
            }}
            src={assets.side_menu_icon}
            alt=""
            className="h-7 w-7 cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-2 md:gap-4 w-full justify-between ">
          <img className="w-25 md:w-35 " src={assets.logo} alt="" />
          <div className="hidden md:flex items-center gap-10">
            <button
              className="bg-gray-700 text-white px-5 py-2 sm;px-7 sm:py-2 rounded-full text-xs sm:text-sm"
              onClick={(e) => handleLogout()}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {
        <div
          className={`fixed top-0 left-0 w-[50%] h-full min-h-screen z-50 bg-white transform transition-transform duration-500 ease-in-out ${
            Sidebar ? "translate-x-0" : "-translate-x-full"
          }
  border-r-2 border-gray-300`}
        >
          <div className="flex flex-col gap-4 pt-6 pl-[5%] text-[15px] cursor-pointer">
            <div
              onClick={() => {
                console.log("Sidebar");
                setSidebar(!Sidebar);
              }}
              className="mr-auto flex  items-center gap-2  ml-1  w-full"
            >
              <img src={assets.cross_icon} alt="" className="w-5 h-5" />
            </div>

            <NavLink
              onClick={() => setSidebar(false)}
              className="flex items-center gap-3 border border-gray-300 px-4 py-2 rounded"
              to="/add"
            >
              <img className="w-5 h-5" src={assets.add_icon} alt="" />
              <p className="font-bold">Add Items</p>
            </NavLink>
            <NavLink
              onClick={() => setSidebar(false)}
              className="flex items-center gap-3 border border-gray-300  px-4 py-2 rounded"
              to="/list"
            >
              <img className="w-5 h-5" src={assets.order_icon} alt="" />
              <p className="font-bold">List Items</p>
            </NavLink>
            <NavLink
              onClick={() => setSidebar(false)}
              className="flex items-center gap-3 border border-gray-300  px-4 py-2 rounded"
              to="/orders"
            >
              <img className="w-5 h-5" src={assets.order_icon} alt="" />
              <p className="font-bold">Orders</p>
            </NavLink>
            <NavLink
              onClick={() => setSidebar(false)}
              className="flex items-center gap-3 border border-gray-300  px-4 py-2 rounded"
              to="/dashboard"
            >
              <img className="w-5 h-5" src={assets.order_icon} alt="" />
              <p className="font-bold">Dashboard</p>
            </NavLink>  
          </div>
        </div>
      }
    </>
  );
};

export default Navbar;
