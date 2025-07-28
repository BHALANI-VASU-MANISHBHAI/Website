import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import { GlobalContext } from "../context/GlobalContext.jsx";
import { UserContext } from "../context/UserContext.jsx";
import { CartContext } from "../context/CartContext.jsx";

const Login = () => {
  const [currentState, setCurrentState] = React.useState("Login");
  const { token, setToken, navigate, backendUrl } =
    React.useContext(GlobalContext);
  const { setCartItems } = React.useContext(CartContext);

  const { setUserData } = React.useContext(UserContext);
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [step, setStep] = useState("login");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (currentState == "Sign up") {
        const response = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
          role: "user",
          cartData: JSON.parse(localStorage.getItem("cartData")) || [],
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);

          const profileResponse = await axios.post(
            backendUrl + "/api/user/getdataofuser",
            {}, // request body, if any
            {
              headers: {
                token: response.data.token, // pass the token in headers
              },
            }
          );

          if (profileResponse.data.success) {
            toast.success("Successfully signed up");
            setUserData(profileResponse.data.user);
          }
          // setUserData(response.data.user);
        } else {
          toast.error(response.data.message || "Failed to sign up");
        }
      } else {
        const response = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
          role: "user",
          cartData: JSON.parse(localStorage.getItem("cartData")) || [],
        });
        if (response.data.success) {
          setToken(response.data.token);
          setCartItems(response.data.cartData || {});
          const profileResponse = await axios.post(
            backendUrl + "/api/user/getdataofuser",
            {}, // request body, if any
            {
              headers: {
                token: response.data.token, // pass the token in headers
              },
            }
          );

          if (profileResponse.data.success) {
            setUserData(profileResponse.data.user);
          }
          localStorage.setItem("token", response.data.token);
          toast.success("Successfully logged in");
        } else {
          console.log("Login error:", response.data);
          toast.error(response.data.message || "Failed to login");
        }
      }
    } catch (e) {
      console.log("Error in login/signup", e);
      toast.error(e.message);
    }
  };

  const handleForgetPassword = async () => {
    try {
      const response = await axios.post(
        backendUrl + "/api/auth/forgot-password",
        {
          email,
          role: "user",
        }
      );
      if (response.data.success) {
        setOtpSent(true);
        toast.success("OTP sent to your email");
        setStep("otp");
        // Open OTP enter modal
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.log("Error in sending OTP", error);
      toast.error(error.message || "Failed to send OTP");
    }
  };
  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post(backendUrl + "/api/auth/verify-otp", {
        email,
        otp,
      });
      if (response.data.success) {
        setOtpVerified(true);
        setStep("reset");
        toast.success("OTP verified");
      } else {
        toast.error(response.data.message || "OTP verification failed");
      }
    } catch (error) {
      toast.error(error.message || "Failed to verify OTP");
    }
  };
  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      setLoading(true);
      const response = await axios.post(
        backendUrl + "/api/auth/reset-password",
        {
          email,
          newPassword: password,
        }
      );
      if (response.data.success) {
        toast.success("Password reset successful. Please login.");
        setOtpSent(false);
        setOtpVerified(false);
        setStep("login"); // back to login
      } else {
        toast.error(response.data.message || "Password reset failed");
      }
    } catch (error) {
      toast.error(error.message || "Password reset error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      console.log("Google token:", token);
      // Send this token to your backend to verify and login/register the user
      const res = await axios.post(backendUrl + "/api/user/google", {
        token,
        role: "user",
        cartData: JSON.parse(localStorage.getItem("cartData")) || [],
      });

      if (res.data.success) {
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
        // Get user profile data from backend
        const profileResponse = await axios.post(
          backendUrl + "/api/user/getdataofuser",
          {},
          { headers: { token: res.data.token } }
        );

        if (profileResponse.data.success) {
          setUserData(profileResponse.data.user);
        }
      } else {
        toast.error(res.data.message || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error(res.data.message || "Google login error");
    }
  };

  // Redirect to home page after successful login/signup
  React.useEffect(() => {
    if (token) {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/");
      }
    }
  }, [token]);

  return (
    <>
      {step === "otp" && (
        <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-6 gap-4">
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full px-3 py-2 border border-gray-800"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            onClick={handleVerifyOtp}
            className="bg-black text-white px-6 py-2 cursor-pointer"
          >
            Verify OTP
          </button>
        </div>
      )}

      {step === "reset" && (
        <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-6 gap-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full px-3 py-2 border border-gray-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-3 py-2 border border-gray-800"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            onClick={handleResetPassword}
            className={`bg-black text-white px-6 py-2 cursor-pointer ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      )}

      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-700 bg-white p-6 rounded-lg shadow-md
          border 
        "
        action=""
      >
        <div className="inline-flex items-center gap-2 mb-2 mt-10">
          <p className="prata-regular text-3xl">{currentState}</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800 mt-2 " />
        </div>
        {currentState == "Login" ? (
          ""
        ) : (
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Name"
            name=""
            id="Name"
            required
          />
        )}
        <input
          type="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Email"
          name=""
          id="Email"
          required
        />
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="w-full px-3 py-2 border border-gray-800 "
            placeholder="Password"
            name=""
            id=""
            required
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-3 right-3 cursor-pointer text-gray-500"
          >
            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
          </span>
        </div>
        <div className="w-full flex  justify-between text-sm mt-[-8px]">
          {currentState == "Login" ? (
            <p onClick={handleForgetPassword} className="cursor-pointer">
              Forget Your Password?
            </p>
          ) : (
            <p></p>
          )}

          {currentState == "Login" ? (
            <p
              onClick={() => setCurrentState("Sign up")}
              className="cursor-pointer"
            >
              Create an Account
            </p>
          ) : (
            <p
              onClick={() => setCurrentState("Login")}
              className="cursor-pointer"
            >
              Login here
            </p>
          )}
        </div>
        <button className="bg-black text-white font-light px-8 py-1 mt-4">
          {currentState == "Login" ? "Login" : "Sign up"}
        </button>
        <h2>or</h2>
        <div className=" flex justify-center">
          {
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => toast.error("Google login failed")}
            />
          }
        </div>
      </form>
    </>
  );
};

export default Login;
