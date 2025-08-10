// pages/ForgotPasswordPage.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { GlobalContext } from "../context/GlobalContext.jsx";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { backendUrl } = useContext(GlobalContext);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setSending(true);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/forgot-password`, {
        email,
        role: "user",
      });
      if (res.data.success) {
        toast.success("OTP sent to your email");
        localStorage.setItem("resetEmail", email);
        navigate("/verify-otp");
      } else {
        toast.error(res.data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error.message || "OTP request failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4">
      <h2 className="text-2xl mb-2">Forgot Password</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Enter your email"
        required
      />
      <button
        onClick={handleSendOtp}
        className={`bg-black text-white px-6 py-2 ${
          sending ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {sending ? "Sending..." : "Send OTP"}
      </button>
    </div>
  );
};

export default ForgotPasswordPage;
