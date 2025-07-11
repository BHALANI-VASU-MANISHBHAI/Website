import axios from "axios";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { GlobalContext } from "../contexts/GlobalContext.jsx";

const ForgotPassword = () => {
  const { backendUrl, navigate } = useContext(GlobalContext);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("request"); // "request" | "verify" | "reset"
  const [loading, setLoading] = useState(false);
  // 1. Send OTP to email
  const handleRequestOtp = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${backendUrl}/api/auth/forgot-password`, {
        email,
        role: "rider",
      });
      if (res.data.success) {
        toast.success("OTP sent to your email");
        setStep("verify");
      } else {
        toast.error(res.data.message || "Failed to send OTP");
        setStep("request");
      }
    } catch (error) {
      toast.error(res.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify the OTP
  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${backendUrl}/api/auth/verify-otp`, {
        email,
        otp,
      });
      if (res.data.success) {
        toast.success("OTP verified");
        setStep("reset");
      } else {
        toast.error(res.data.message || "OTP verification failed");
      }
    } catch (error) {
      toast.error("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // 3. Reset password
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      const res = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email,
        newPassword,
      });
      if (res.data.success) {
        toast.success("Password reset successful. Please login.");
        navigate("/login");
      } else {
        toast.error(res.data.message || "Reset failed");
      }
    } catch (error) {
      toast.error("Password reset error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="w-full max-w-md bg-white shadow-lg p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold text-center">Reset Password</h2>

        {/* Step 1: Enter email to receive OTP */}
        {step === "request" && (
          <>
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              onClick={handleRequestOtp}
              className={`w-full bg-blue-600 text-white py-2 rounded-lg ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* Step 2: Enter OTP */}
        {step === "verify" && (
          <>
            <input
              type="number"
              placeholder="Enter OTP"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={otp}
              x
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button
              onClick={handleVerifyOtp}
              className={`w-full bg-blue-600 text-white py-2 rounded-lg ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* Step 3: Reset password */}
        {step === "reset" && (
          <>
            <input
              type="password"
              placeholder="New Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              onClick={handleResetPassword}
              className={`w-full bg-blue-600 text-white py-2 rounded-lg ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
