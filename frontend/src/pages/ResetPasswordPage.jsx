// pages/ResetPasswordPage.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { GlobalContext } from "../context/GlobalContext.jsx";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { backendUrl } = useContext(GlobalContext);
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleReset = async () => {
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      const res = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email,
        newPassword: password,
      });
      if (res.data.success) {
        toast.success("Password reset successful");
        localStorage.removeItem("resetEmail");
        navigate("/login");
      } else {
        toast.error(res.data.message || "Reset failed");
      }
    } catch (err) {
      toast.error(err.message || "Reset error");
    }
  };

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4">
      <h2 className="text-2xl mb-2">Reset Password</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="New Password"
        required
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Confirm Password"
        required
      />
      <button onClick={handleReset} className="bg-black text-white px-6 py-2">
        Reset Password
      </button>
    </div>
  );
};

export default ResetPasswordPage;
