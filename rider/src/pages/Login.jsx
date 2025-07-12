import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import assets from "../assets/assets.js";
import { GlobalContext } from "../contexts/GlobalContext.jsx";
import { UserContext } from "../contexts/UserContext.jsx";

const Login = () => {
  const { backendUrl, navigate, setToken, token } = useContext(GlobalContext);
  const { getUserData } = useContext(UserContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "rider",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/login`,
        formData
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        getUserData(response.data.token);
        toast.success("Login successful");
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const token = credentialResponse?.credential;
    if (!token) {
      toast.error("Invalid Google token");
      return;
    }

    try {
      const res = await axios.post(`${backendUrl}/api/user/google`, {
        token,
        role: "rider",
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        getUserData(res.data.token);
        toast.success("Google login successful");
      } else {
        toast.error(res.data.message || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login error");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-50">
      {/* Left Image Section */}
      <div className="w-full md:w-[60%] flex items-center justify-center bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-50 opacity-30"></div>
        <div className="relative z-10 p-8 text-center">
          <img
            src={assets.delivery_boy}
            alt="Delivery"
            className="w-full max-w-lg h-auto object-contain mx-auto mb-6"
          />
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-800">Welcome Back!</h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Sign in to your account to continue your delivery experience
            </p>
          </div>
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="w-full md:w-[40%] flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2"> Login</h2>
            <p className="text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white pr-12"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <AiFillEyeInvisible className="w-5 h-5" />
                  ) : (
                    <AiFillEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-600 text-white font-semibold py-3 rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Login....
                </div>
              ) : (
                "Login"
              )}
            </button>

            {/* Links */}
            <div className="flex justify-between items-center text-sm">
              <Link
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                to="/forgot-password"
              >
                Forgot Password?
              </Link>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                onClick={() => navigate("/signup")}
              >
                Create Account
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm font-medium">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Login */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-full max-w-xs">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => toast.error("Google login failed")}
                  theme="outline"
                  size="large"
                  width="100%"
                />
              </div>
            </div>

           
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
