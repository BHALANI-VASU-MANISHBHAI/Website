import React from "react";
import { useContext } from "react";
import Title from "../components/Title";
import { assetss } from "../assets/frontend_assets/assetss";
import CartTotal from "./../components/CartTotal";
import cloneDeep from "lodash-es/cloneDeep";
import axios from "axios";
import { toast } from "react-toastify";
import Indian_Cities_In_States_JSON from "../assets/Indian_Cities_In_States_JSON.json";
import { GlobalContext } from "../context/GlobalContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import { UserContext } from "../context/UserContext.jsx";
import { ProductContext } from "../context/ProductContext.jsx";
import { useEffect } from "react";

const PlaceOrder = () => {
  const { navigate, backendUrl, token, delivery_fee } =
    useContext(GlobalContext);
  const { cartItems, setCartItems, getCartAmount } = useContext(CartContext); 
  const { products } = useContext(ProductContext);
  const { userData } = useContext(UserContext);
  const [actualAmount, setActualAmount] = React.useState(0);
  const [Subscriber, setSubscriber] = React.useState(false);
  const [method, setMethod] = React.useState("cod");
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
  // OTP-related state
  const [otpSessionId, setOtpSessionId] = React.useState(null);
  const [otpInput, setOtpInput] = React.useState("");
  const [otpVerified, setOtpVerified] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [PlaceOrder, setPlaceOrder] = React.useState(false);

  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  // ✅ Load Razorpay only when needed
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (
        document.querySelector(
          "script[src='https://checkout.razorpay.com/v1/checkout.js']"
        )
      ) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  const sendOtp = async () => {
    if (!formData.phone) {
      toast.error("Please enter phone number");
      return;
    }
    setOtpLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/phone-otp`,
        { phone: formData.phone },
        { headers: { token } }
      );
      if (response.data.success) {
        setOtpSessionId(response.data.sessionId);
        setOtpSent(true);
        toast.success("OTP sent to your phone");
      } else {
        toast.error("Failed to send OTP");
      }
    } catch (error) {
      toast.error("Error sending OTP");
    } finally {
      setOtpLoading(false);
    }
  };



  // Verify OTP function
  const verifyOtp = async () => {
    if (!otpInput) {
      toast.error("Please enter OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/verify-phone-otp`,
        { sessionId: otpSessionId, otp: otpInput },
        { headers: { token } }
      );
      if (response.data.success) {
        setOtpVerified(true);
        toast.success("OTP verified successfully");
      } else {
        toast.error("Invalid OTP");
      }
    } catch (error) {
      toast.error("Error verifying OTP");
    } finally {
      setOtpLoading(false);
    }
  };
  // Spinner Component
  const Spinner = () => (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );

  React.useEffect(() => {
    const checkSubscriber = async () => {
      try {
        const response = await axios.post(
          backendUrl + "/api/subscriber/checksubscriber",
          { email: userData.email },
          { headers: { token } }
        );
        setSubscriber(response.data.success);
      } catch (error) {
        toast.error("Failed to fetch subscriber data.");
      }
    };

    if (userData?.email) {
      if (Subscriber) return; // If already checked, skip
      checkSubscriber();
    }
  }, [userData]);

  const isValidAddress = (state, city) => {
    const normalizedState = state.trim().toLowerCase();
    const normalizedCity = city.trim().toLowerCase();
    for (const [stateKey, cities] of Object.entries(
      Indian_Cities_In_States_JSON
    )) {
      if (stateKey.toLowerCase() === normalizedState) {
        return cities.some((c) => c.toLowerCase() === normalizedCity);
      }
    }
    return false;
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name == "phone" && otpVerified) {
      // Reset OTP state if phone number changes after verification
      setOtpSent(false);
      setOtpVerified(false);
      setOtpInput("");
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (PlaceOrder) {
      return;
    }

    if (!isValidAddress(formData.state, formData.city)) {
      toast.error("Please enter a valid state and city combination.");
      return;
    }

    const zipcode = formData.zipcode;
    if (!/^\d{6}$/.test(zipcode)) {
      toast.error("Please enter a valid 6-digit Indian zipcode.");
      return;
    }

    setPlaceOrder(true);

    let orderItems = [];
    for (const item in cartItems) {
      for (const size in cartItems[item]) {
        if (cartItems[item][size] > 0) {
          const itemInfo = cloneDeep(products.find((p) => p._id === item));
          if (itemInfo) {
            itemInfo.size = size;
            itemInfo.quantity = cartItems[item][size];
            orderItems.push(itemInfo);
          }
        }
      }
    }

    let orderData = {
      address: formData,
      items: orderItems,
      amount:
        getCartAmount() +
        delivery_fee -
        (Subscriber ? getCartAmount() * 0.2 : 0),
    };
    console.log("Order Data:", orderData);
    try {
      if (method === "cod") {
        const response = await axios.post(
          backendUrl + "/api/order/place",
          orderData,
          { headers: { token } }
        );
        if (response.data.success) {
          setCartItems({});
          navigate("/orders");
        } else {
          toast.error(response.data.message);
        }
      } else if (method === "razorpay") {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error("Failed to load Razorpay. Try again.");
          return;
        }

        const razorpayResponse = await axios.post(
          backendUrl + "/api/order/razorpay",
          {
            orderData,
          },
          { headers: { token } }
        );

        if (razorpayResponse.data.success) {
          const options = {
            key: razorpayKey,
            amount: razorpayResponse.data.razorpayOrder.amount,
            currency: "INR",
            name: "Vasu Store",
            description: "Order Payment",
            order_id: razorpayResponse.data.razorpayOrder.id,
            handler: async (response) => {
              try {
                const verifyResponse = await axios.post(
                  backendUrl + "/api/order/verify-order-razorpay",
                  {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    orderData: orderData,
                  },
                  { headers: { token } }
                );

                if (verifyResponse.data.success) {
                  setCartItems({});
                  navigate("/orders");
                } else {
                  toast.error(verifyResponse.data.message);
                }
              } catch (error) {
                toast.error("Payment verification failed.");
              } finally {
                setPlaceOrder(false); // Reset here too
              }
            },
            prefill: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              contact: formData.phone,
            },
            theme: {
              color: "#F37254",
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          toast.error(razorpayResponse.data.message);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setPlaceOrder(false); // This ensures the loading state is always reset
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-15 min-h-[80vh] border-t"
    >
      <div className=" transition-opacity ease-in duration-500 opacity-100 block sm:hidden">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 text-sm"
        >
          ← Back
        </button>
      </div>
      {/* Left Section */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>

        {/* Name Fields */}
        <div className="flex gap-3">
          <input
            required
            name="firstName"
            value={formData.firstName}
            onChange={onChangeHandler}
            placeholder="First name"
            className="border py-1.5 px-3.5 rounded-md w-full"
          />
          <input
            required
            name="lastName"
            value={formData.lastName}
            onChange={onChangeHandler}
            placeholder="Last name"
            className="border py-1.5 px-3.5 rounded-md w-full"
          />
        </div>

        <input
          required
          name="email"
          value={formData.email}
          onChange={onChangeHandler}
          placeholder="Email Address"
          className="border py-1.5 px-3.5 rounded-md w-full"
        />
        <input
          required
          name="street"
          value={formData.street}
          onChange={onChangeHandler}
          placeholder="Street"
          className="border py-1.5 px-3.5 rounded-md w-full"
        />

        <div className="flex gap-3">
          <select
            required
            name="city"
            value={formData.city}
            onChange={onChangeHandler}
            className="border py-1.5 px-3.5 rounded-md w-full"
          >
            <option value="" disabled>
              Select City
            </option>
            {Indian_Cities_In_States_JSON[formData.state]?.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <select
            name="state"
            value={formData.state}
            onChange={onChangeHandler}
            className="border py-1.5 px-3.5 rounded-md w-full"
          >
            <option value="" disabled>
              Select State
            </option>
            {Object.keys(Indian_Cities_In_States_JSON).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <input
            required
            name="zipcode"
            value={formData.zipcode}
            onChange={onChangeHandler}
            placeholder="ZipCode"
            type="number"
            className="border py-1.5 px-3.5 rounded-md w-full"
          />
          <input
            required
            name="country"
            value={formData.country}
            onChange={onChangeHandler}
            placeholder="Country"
            className="border py-1.5 px-3.5 rounded-md w-full"
          />
        </div>

        <input
          required
          name="phone"
          value={formData.phone}
          onChange={onChangeHandler}
          placeholder="Phone"
          type="number"
          className="border py-1.5 px-3.5 rounded-md w-full"
        />
        {!otpSent && (
          <button
            type="button"
            onClick={sendOtp}
            disabled={otpLoading || !formData.phone}
            className="mt-2 bg-gray-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            {otpLoading ? "Sending OTP..." : "Send OTP"}
          </button>
        )}

        {otpSent && !otpVerified && (
          <>
            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="Enter OTP"
              className="border py-1.5 px-3.5 rounded-md w-full mt-2"
            />
            <button
              type="button"
              onClick={verifyOtp}
              disabled={otpLoading}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
            >
              {otpLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {otpVerified && (
          <p className="text-green-600 mt-2">Phone number verified ✅</p>
        )}
      </div>

      {/* Right Section */}
      <div className="mt-8">
        <CartTotal IsSubcriberornot={Subscriber} />

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          <div className="flex gap-2 flex-col lg:flex-row">
            <div
              onClick={() => setMethod("razorpay")}
              className="flex items-center gap-3 border p-1 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 rounded-full ${
                  method === "razorpay" ? "bg-green-400" : ""
                }`}
              />
              <img
                src={assetss.razorpay_logo}
                alt="razorpay"
                className="h-5 mx-4"
              />
            </div>
            <div
              onClick={() => setMethod("cod")}
              className="flex items-center gap-3 border p-1 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 rounded-full ${
                  method === "cod" ? "bg-green-400" : ""
                }`}
              />
              <p className="text-gray-500 text-sm font-medium m-4">
                CASH ON DELIVERY
              </p>
            </div>
          </div>

          <div className="w-full flex justify-end mt-8">
            <button
              type="submit"
              className="bg-black text-white px-16 py-3 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={PlaceOrder}
            >
              {PlaceOrder ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <span>Placing Order...</span>
                </div>
              ) : (
                "PLACE ORDER"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
