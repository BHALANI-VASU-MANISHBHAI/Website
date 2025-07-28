import axios from "axios";
import cloneDeep from "lodash-es/cloneDeep";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { assetss } from "../assets/frontend_assets/assetss";
import Indian_Cities_In_States_JSON from "../assets/Indian_Cities_In_States_JSON.json";
import Title from "../components/Title";
import { CartContext } from "../context/CartContext.jsx";
import { GlobalContext } from "../context/GlobalContext.jsx";
import { ProductContext } from "../context/ProductContext.jsx";
import { UserContext } from "../context/UserContext.jsx";
import CartTotal from "./../components/CartTotal";
import { set } from "lodash";

const PlaceOrder = () => {
  const { navigate, backendUrl, token, delivery_fee } =
    useContext(GlobalContext);
  const { cartItems, setCartItems, getCartAmount } = useContext(CartContext);
  const { products } = useContext(ProductContext);
  const { userData } = useContext(UserContext);
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
  const [lat, setLat] = React.useState("");
  const [long, setLong] = React.useState("");
  const [isValidData, setIsValidData] = React.useState(false);
  const [incorrectData, setIncorrectData] = useState([]); // State to hold incorrect data

  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    phone: "",
    mapLink: "",
    latitude: "",
    longitude: "",
  });

  const handleMapLinkChange = (e) => {
    const mapLink = e.target.value.trim();
    if (!mapLink) {
      setFormData((prev) => ({
        ...prev,
        mapLink: "",
        latitude: "",
        longitude: "",
      }));
      setLat("");
      setLong("");
      setIncorrectData([]);
      setIsValidData(false);
      return;
    }
    setFormData((prev) => ({ ...prev, mapLink }));

    const atMatch = mapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const qMatch = mapLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);

    const latitude = atMatch?.[1] || qMatch?.[1] || "";
    const longitude = atMatch?.[2] || qMatch?.[2] || "";

    console.log("Parsed latitude:", latitude, "longitude:", longitude);
    if (latitude && longitude) {
      setFormData((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
      setLat(latitude);
      setLong(longitude);
    } else {
      setIncorrectData([
        "Please provide a valid Google Maps link with @lat,long or ?q=lat,long format.",
      ]);
      setIsValidData(false);
    }
  };

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
  const fetchAddressFromLatLng = async () => {
    if (lat && long) {
      setIsValidData(false);
      try {
        if (!formData.mapLink) {
          setIncorrectData([]);
          setIsValidData(true);
          return; 
        }
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`
        );
        console.log("Reverse geocoding response:", res);
        const data = await res.json();
        console.log("Reverse geocoding data:", data);
        const rev = data.address;
        const mismatchList = [];
        const formCountry = formData.country?.trim().toLowerCase();
        const formState = formData.state?.trim().toLowerCase();
        const formCity = formData.city?.trim().toLowerCase();
        const formZip = formData.pincode?.trim();
        const revCountry = rev?.country?.toLowerCase();
        const revState = rev?.state?.toLowerCase();
        const revCity =
          rev?.state_district?.toLowerCase() || rev?.city?.toLowerCase();
        const revZip = rev?.postcode?.trim();

        if (formCountry && revCountry && !revCountry.includes(formCountry)) {
          mismatchList.push("Country");
        }
        if (formState && revState && !revState.includes(formState)) {
          mismatchList.push("State");
        }
        console.log("formZip", formZip, " revZip", revZip);
        if (formZip && revZip && formZip !== revZip) {
          mismatchList.push("pincode should be " + revZip);
          // setFormData((prevData) => ({
          //   ...prevData,
          //   pincode: revZip, // Update formData with correct pincode
          // }));
        }

        if (mismatchList.length > 0) {
          setIncorrectData(mismatchList);
          setIsValidData(false);
          return false;
        } else {
          setIncorrectData([]);
          setIsValidData(true);
          return true;
        }
      } catch (err) {
        // console.error("Reverse geocoding failed:", err);
        setIncorrectData([
          "Failed to fetch address from coordinates. Please check your map link.",
        ]);
        setIsValidData(false);
        return false;
      }
    }
    return true;
  };

  const fetchCityLanandLong = async (city, state) => {
    try {
      if (!city || (!state && !lat && !long)) {
        setLat("");
        setLong("");
      }
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${city}&state=${state}&format=json&limit=1`
      );
      const data = await response.json();
      console.log("City search response:", data);
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setLat(lat);
        setLong(lon);
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
        }));
      } else {
        console.error("No results found for the city/state combination.");
      }
    } catch (error) {
      console.error("Error fetching city coordinates:", error);
      setLat("");
      setLong("");
      toast.error("Failed to fetch city coordinates. Please check your input.");
    }
  };

  useEffect(() => {
    if (formData.city && formData.state) {
      fetchCityLanandLong(formData.city, formData.state);
    }
  }, [formData.city, formData.state]);

  useEffect(() => {
    fetchAddressFromLatLng();
  }, [lat, long, formData]);

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

    if (PlaceOrder) return;

    // 1. Validate state/city combo
    if (!isValidAddress(formData.state, formData.city)) {
      toast.error("Please enter a valid state and city combination.");
      return;
    }

    // 2. Validate Indian Pincode
    if (!/^\d{6}$/.test(formData.pincode)) {
      toast.error("Please enter a valid 6-digit Indian pincode.");
      return;
    }

    // 3. Validate location via reverse geocoding
    const locationValid = await fetchAddressFromLatLng();
    if (!locationValid) return;

    // 4. Create order payload
    setPlaceOrder(true); // disable button

    const orderItems = [];

    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        const quantity = cartItems[productId][size];
        if (quantity > 0) {
          const item = cloneDeep(products.find((p) => p._id === productId));
          if (item) {
            item.size = size;
            item.quantity = quantity;
            orderItems.push(item);
          }
        }
      }
    }

    const totalAmount =
      getCartAmount() + delivery_fee - (Subscriber ? getCartAmount() * 0.2 : 0);

    const orderData = {
      address: formData,
      items: orderItems,
      amount: totalAmount,
    };

    try {
      // 5. Place COD Order
      if (method === "cod") {
        const response = await axios.post(
          `${backendUrl}/api/order/place`,
          orderData,
          { headers: { token } }
        );

        if (response.data.success) {
          setCartItems({});
          toast.success("Order placed successfully.");
          navigate("/orders");
        } else {
          toast.error(response.data.message || "Failed to place order.");
        }
      }

      // 6. Razorpay Payment Flow
      else if (method === "razorpay") {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error("Failed to load Razorpay. Try again.");
          return;
        }

        const razorpayResponse = await axios.post(
          `${backendUrl}/api/order/razorpay`,
          { orderData },
          { headers: { token } }
        );

        if (!razorpayResponse.data.success) {
          toast.error(
            razorpayResponse.data.message || "Payment initialization failed."
          );
          return;
        }

        const { razorpayOrder } = razorpayResponse.data;

        const options = {
          key: razorpayKey,
          amount: razorpayOrder.amount,
          currency: "INR",
          name: "Vasu Store",
          description: "Order Payment",
          order_id: razorpayOrder.id,
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone,
          },
          theme: { color: "#F37254" },
          handler: async function (response) {
            try {
              const verifyRes = await axios.post(
                `${backendUrl}/api/order/verify-order-razorpay`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderData,
                },
                { headers: { token } }
              );

              if (verifyRes.data.success) {
                setCartItems({});
                toast.success("Payment successful, order placed.");
                navigate("/orders");
              } else {
                toast.error(
                  verifyRes.data.message || "Payment verification failed."
                );
              }
            } catch (err) {
              toast.error("Error verifying payment.");
            } finally {
              setPlaceOrder(false);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong during order placement.");
    } finally {
      setPlaceOrder(false);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
        phone: "",
        mapLink: "",
        latitude: "",
        longitude: "",
      });
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
      <fieldset className="flex-1" disabled={PlaceOrder}>
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
              {Indian_Cities_In_States_JSON[formData.state]?.map(
                (city, index) => (
                  <option key={`${city}-${index}`} value={city}>
                    {city}
                  </option>
                )
              )}
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
              name="pincode"
              value={formData.pincode}
              onChange={(e) => {
                // Allow only numbers and limit to 6 digits
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                onChangeHandler({
                  target: {
                    name: e.target.name,
                    value: value,
                  },
                });
              }}
              placeholder="6-digit pincode"
              type="text" // Using text instead of number for better control
              inputMode="numeric" // Shows numeric keyboard on mobile
              pattern="[0-9]{6}" // HTML5 pattern validation
              maxLength="6" // Limits to 6 characters
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
            max="9999999999"
            type="tel"
            pattern="[0-9]{10}"
            maxLength="10"
            className="border py-1.5 px-3.5 rounded-md w-full"
          />
          {/* {!otpSent && (
          <button
            type="button"
            onClick={sendOtp}
            disabled={otpLoading || !formData.phone}
            className="mt-2 bg-gray-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            {otpLoading ? "Sending OTP..." : "Send OTP"}
          </button>
        )} */}

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
          <input
            id="mapLink"
            type="text"
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none ${
              incorrectData.mapLink ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Paste Google Maps link (with @lat,long)"
            value={formData.mapLink}
            onChange={handleMapLinkChange}
          />

          {incorrectData.mapLink && (
            <p className="text-red-500 text-xs mt-1 whitespace-pre-line">
              {incorrectData.mapLink}
            </p>
          )}

          {incorrectData && Object.keys(incorrectData).length > 0 && (
            <div className="text-red-500 text-sm mt-2">
              <p>
                Please check the following fields for accuracy:
                {incorrectData.map((field, index) => (
                  <span key={index}>
                    {field}
                    {index < incorrectData.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            </div>
          )}
          <iframe
            title="Google Map"
            width="100%"
            height="300"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
            src={`https://maps.google.com/maps?q=${lat},${long}&z=15&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {otpVerified && (
            <p className="text-green-600 mt-2">Phone number verified ✅</p>
          )}
        </div>
      </fieldset>

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
              className={`bg-gray-700 text-white px-6 py-2 cursor-pointer text-sm font-semibold flex items-center gap-2 ${
                PlaceOrder || incorrectData.length > 0
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
              disabled={PlaceOrder || incorrectData.length > 0}
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
