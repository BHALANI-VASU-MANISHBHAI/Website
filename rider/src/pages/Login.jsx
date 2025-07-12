import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Link, } from "react-router-dom";
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
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Left Image */}
      <div className="w-full md:w-[60%] flex items-center justify-center bg-gray-100 ">
        <img
          src={assets.delivery_boy}
          alt="Delivery"
          className="w-full md:h-full h-auto object-contain p-4"
        />
      </div>

      {/* Right Login Form */}
      <div className="w-full md:w-[40%] flex items-center justify-center bg-white p-6 ">
        <div className="w-full max-w-md p-6 rounded-2xl shadow-lg">
          <button className="text-2xl font-bold mb-6 text-center text-gray-700 cursor-pointer">
            Login
          </button>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500
                  cursor-pointer
                  "
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-700 text-white font-semibold py-2 rounded-lg hover:bg-gray-800 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <div className="flex justify-between text-sm text-gray-500 mt-4">
              <Link
                className="cursor-pointer hover:text-gray-700"
                to="/forgot-password"
              >
                forget Password ?
              </Link>

              <p
                className="cursor-pointer hover:text-gray-700"
                onClick={() => navigate("/signup")}
              >
                create account
              </p>
            </div>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-center">
            <div className="border-t w-1/4" />
            <span className="mx-3 text-gray-500 text-sm">OR</span>
            <div className="border-t w-1/4" />
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center">
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
  );
};

export default Login;
