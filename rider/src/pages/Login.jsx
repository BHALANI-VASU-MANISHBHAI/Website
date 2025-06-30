import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import assets from '../assets/assets.js'; // Same image used for visual consistency
import { GlobalContext } from '../contexts/GlobalContext.jsx';
import { UserContext } from '../contexts/UserContext.jsx';
import { useContext } from 'react';


const Login = () => {
    
    const { backendUrl ,navigate ,setToken} = useContext(GlobalContext);
    const { getUserData} = useContext(UserContext);
    
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(backendUrl + '/api/user/login', formData);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token); // Store token in localStorage
        setToken(response.data.token); // Set token in context
        navigate('/'); // Redirect to home page
        getUserData(response.data.token); 
        toast.success('Login successful');
        // Redirect or set auth token here
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during login');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Left Image */}
      <div className="w-full md:w-[60%] lg:h-full flex items-center justify-center bg-gray-100">
        <img
          src={assets.delivery_boy}
          alt="Delivery"
          className="w-full md:h-full h-auto object-contain md:object-contain p-4"
        />
      </div>

      {/* Right Login Form */}
      <div className="w-full md:w-[40%] flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Email</label>
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
              <label className="text-sm font-semibold text-gray-600">Password</label>
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

            <button
              type="submit"
              className="w-full bg-gray-500 text-white font-semibold py-2 rounded-lg hover:bg-gray-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
