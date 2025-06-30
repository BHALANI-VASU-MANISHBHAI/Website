import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import assets from "../assets/assets.js";
import { useContext } from "react";
import { GlobalContext } from "../contexts/GlobalContext.jsx";
import { UserContext } from "../contexts/UserContext.jsx";

const Signup = () => {
  const { backendUrl, setToken } = useContext(GlobalContext);
  const { getUserData } = useContext(UserContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "rider", // Default role set to 'rider'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      // Send the form data to the backend for registration
      console.log("Form Data:", formData);
      const response = await axios.post(
        backendUrl + "/api/user/register",
        formData
      );
      console.log("Response:", response.data);
      if (response.data.success) {
        setToken(response.data.token); // Set token in context
        localStorage.setItem("token", response.data.token); // Store token in localStorage
        getUserData(response.data.token); // Fetch user data after signup
        toast.success("Signup successful");
      } else {
        toast.error(response.data.message || "Signup failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during signup");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Left Image Section */}
      <div className="w-full md:w-[60%] lg:h-full flex items-center justify-center bg-gray-100">
        <img
          src={assets.delivery_boy}
          alt="Delivery"
          className="w-full md:h-full h-auto object-contain md:object-contain p-4"
        />
      </div>

      {/* Right Signup Section */}
      <div className="w-full md:w-[40%] flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
            Sign Up
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Full Name"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email Address"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm Password"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-500 text-white font-semibold py-2 rounded-lg hover:bg-gray-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
