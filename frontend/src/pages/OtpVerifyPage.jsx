// pages/OtpVerifyPage.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { GlobalContext } from "../context/GlobalContext.jsx";

const OtpVerifyPage = () => {
  const [otp, setOtp] = useState("");
  const { backendUrl } = useContext(GlobalContext);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleVerify = async () => {
    if (!otp) {
      return toast.error("Please enter the OTP");
    }
    setVerifying(true);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/verify-otp`, {
        email,
        otp,
      });
      if (res.data.success) {
        toast.success("OTP verified");
        navigate("/reset-password");
      } else {
        toast.error(res.data.message || "OTP verification failed");
      }
    } catch (error) {
      toast.error(error.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4">
      <h2 className="text-2xl mb-2">Verify OTP</h2>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Enter OTP"
        maxLength={6}
        minLength={6}
        required
      />
      <button
        onClick={handleVerify}
        className={`bg-black text-white px-6 py-2 ${
          verifying ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {verifying ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );
};

export default OtpVerifyPage;
