// pages/LoginPage.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { GlobalContext } from "../context/GlobalContext.jsx";
import { UserContext } from "../context/UserContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { setUserData } = useContext(UserContext);
  const { setCartItems } = useContext(CartContext);
  const { setToken, backendUrl } = useContext(GlobalContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${backendUrl}/api/user/login`, {
        email,
        password,
        role: "user",
        cartData: JSON.parse(localStorage.getItem("cartData")) || [],
      });

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        setCartItems(response.data.cartData || {});

        const profileRes = await axios.post(
          `${backendUrl}/api/user/getdataofuser`,
          {},
          { headers: { token: response.data.token } }
        );

        if (profileRes.data.success) {
          setUserData(profileRes.data.user);
          toast.success("Successfully logged in");
          navigate("/");
        }
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (err) {
      toast.error(err.message || "Login error");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const res = await axios.post(`${backendUrl}/api/user/google`, {
        token,
        role: "user",
        cartData: JSON.parse(localStorage.getItem("cartData")) || [],
      });

      if (res.data.success) {
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
        const profileResponse = await axios.post(
          `${backendUrl}/api/user/getdataofuser`,
          {},
          { headers: { token: res.data.token } }
        );
        if (profileResponse.data.success) {
          setUserData(profileResponse.data.user);
          navigate("/");
        }
      } else {
        toast.error(res.data.message || "Google login failed");
      }
    } catch (error) {
      toast.error("Google login error");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-700 bg-white p-6 rounded-lg shadow-md border"
    >
      <h2 className="text-2xl mb-2">Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        required
      />
      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Password"
          required
        />
        <span
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute top-3 right-3 cursor-pointer text-gray-500"
        >
          {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
        </span>
      </div>
      <div className="w-full flex justify-between text-sm">
        <Link to="/forgot-password">Forgot Password?</Link>
        <Link to="/register">Create Account</Link>
      </div>
      <button className="bg-black text-white font-light px-8 py-2 mt-2">
        Login
      </button>
      <h2>or</h2>
      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={() => toast.error("Google login failed")}
      />
    </form>
  );
};

export default LoginPage;
