import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { GlobalContext } from "../contexts/GlobalContext";
import { OrderContext } from "../contexts/OrderContext";

const Orders = () => {
  const { currentOrder, setCurrentOrder, currentLocation } =
    useContext(OrderContext);
  const { backendUrl, token } = useContext(GlobalContext);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);

  const [riderLocation, setRiderLocation] = useState({ lat: null, lng: null });
  const [distanceFromPickup, setDistanceFromPickup] = useState(null);
  const [timeFromPickup, setTimeFromPickup] = useState(null);
  const [distanceFromDelivery, setDistanceFromDelivery] = useState(null);
  const [timeFromDelivery, setTimeFromDelivery] = useState(null);
  const [locationIsValid, setLocationIsValid] = useState(false);

  const calculateDistanceAndTime = async (from, to, setDistFn, setTimeFn) => {
    try {
      const url = `https://us1.locationiq.com/v1/directions/driving/${
        from.lng
      },${from.lat};${to.lng || to.longitude},${
        to.lat || to.latitude
      }?key=pk.231231dbbc3adaf8b1d5637c69074b32&overview=false&steps=false`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes?.length) {
        const route = data.routes[0];
        setDistFn((route.distance / 1000).toFixed(2)); // in km
        setTimeFn(Math.ceil(route.duration / 60)); // in minutes
      }
    } catch (err) {
      console.error("❌ Failed to calculate route:", err);
    }
  };

  useEffect(() => {
    let watchId;
    console.log("Current Order:", currentOrder);
    if (currentOrder && "geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const loc = { lat: latitude, lng: longitude };
          setRiderLocation(loc);

          calculateDistanceAndTime(
            loc,
            currentOrder.pickUpLocation,
            setDistanceFromPickup,
            setTimeFromPickup
          );
          calculateDistanceAndTime(
            loc,
            currentOrder.address,
            setDistanceFromDelivery,
            setTimeFromDelivery
          );
        },
        (err) => {
          console.error("Geolocation error:", err);
          toast.error("⚠️ Unable to fetch live location.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [currentOrder]);

  useEffect(() => {}, [currentOrder]);
  const sendOTP = async () => {
    setSending(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/send-delivery-otp`,
        { orderId: currentOrder._id },
        { headers: { token } }
      );
      if (response.data.success) {
        setOtpSent(true);
        toast.success("OTP sent successfully!");
      } else {
        toast.error(response.data.message);
      }
    } catch {
      toast.error("❌ Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length < 4) {
      toast.warning("Please enter a valid OTP");
      return;
    }
    setVerifying(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/verify-delivery-otp`,
        { orderId: currentOrder._id, otp },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("✅ OTP verified successfully!");
        setCurrentOrder(null);
      } else {
        toast.error(response.data.message);
      }
    } catch {
      toast.error("❌ Failed to verify OTP");
    } finally {
      setVerifying(false);
    }
  };

  const ChangedToShipped = async () => {
    try {
      console.log("Backend URL:", backendUrl);
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId: currentOrder._id, status: "Shipped" },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Order status changed to Shipped!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error changing order status to shipped:", error);
      toast.error("❌ Failed to change order status");
    }
  };

  const checkValidLocation = (location) => {
    if (currentOrder && currentOrder.pickUpLocation) {
      const { lat, lng } = currentOrder.pickUpLocation;
      const distance = Math.sqrt(
        Math.pow(location.lat - lat, 2) + Math.pow(location.lng - lng, 2)
      );
      setLocationIsValid(distance < 0.1); // 100 meters threshold
    }
  };

  useEffect(() => {
    if (currentLocation) {
      checkValidLocation(currentLocation);
    }
  }, [currentLocation, currentOrder]);

  if (!currentOrder) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="mt-4">No current orders.</p>
      </div>
    );
  }

  const {
    amount,
    address,
    pickUpAddress,
    pickUpLocation,
    paymentMethod,
    paymentStatus,
    status,
    date,
    earning,
  } = currentOrder;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <div className="border rounded-lg shadow-md p-4 space-y-4 bg-white">
        <h2 className="text-xl font-semibold text-blue-700">
          📦 Order Summary
        </h2>
        <p>
          <strong>Order Amount:</strong> ₹{amount}
        </p>
        <p>
          <strong>Rider Earnings:</strong> ₹{earning.amount}
        </p>
        <p>
          <strong>Payment:</strong> {paymentMethod} ({paymentStatus})
        </p>
        <p>
          <strong>Status:</strong> {status}
        </p>
        <p>
          <strong>Date:</strong> {new Date(date).toLocaleString()}
        </p>

        <hr />

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-green-700">🏭 Pickup Location</h3>
            <p>
              {pickUpAddress.street}, {pickUpAddress.city},{" "}
              {pickUpAddress.state} - {pickUpAddress.pincode}
            </p>
            <iframe
              title="Pickup Map"
              src={`https://maps.google.com/maps?q=${pickUpLocation.lat},${pickUpLocation.lng}&z=15&output=embed`}
              width="100%"
              height="300"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>

          <div>
            <h3 className="font-semibold text-purple-700">
              🏠 Delivery Location
            </h3>
            <p>
              {address.street}, {address.city}, {address.state} -{" "}
              {address.zipcode}
            </p>
            <p>{address.country}</p>
            <p>
              <strong>Phone:</strong> {address.phone}
            </p>
            <p>
              <strong>Email:</strong> {address.email}
            </p>
            <iframe
              title="Delivery Map"
              src={`https://maps.google.com/maps?q=${address.latitude},${address.longitude}&z=15&output=embed`}
              width="100%"
              height="300"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>

        <hr />

        {distanceFromPickup && (
          <p className="text-yellow-600">
            📍 Distance to Pickup: {distanceFromPickup} km (~{timeFromPickup}{" "}
            min)
          </p>
        )}
        {distanceFromDelivery && (
          <p className="text-pink-600">
            🚚 Distance to Delivery: {distanceFromDelivery} km (~
            {timeFromDelivery} min)
          </p>
        )}

        {distanceFromPickup && distanceFromDelivery && (
          <>
            <p className="text-indigo-600 font-medium">
              📏 Total Distance:{" "}
              {(
                parseFloat(distanceFromPickup) +
                parseFloat(distanceFromDelivery)
              ).toFixed(2)}{" "}
              km
            </p>
            <p className="text-green-700 font-medium">
              🕐 Estimated Total Time: {timeFromPickup + timeFromDelivery} min
            </p>
          </>
        )}

        <hr />
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          {status === "Packing" && locationIsValid && (
            // <p className="text-red-600 font-semibold">
            //    Order is currently being packed. Please wait for further updates.
            // </p>
            <button
              onClick={ChangedToShipped}
              className="px-4 py-2 bg-blue-600 text-white rounded-md w-full sm:w-[150px] hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={status !== "Packing"}
            >
              Mark as Shipped
            </button>
          )}
          <button
            onClick={sendOTP}
            disabled={sending || verifying}
            className={`px-4 py-2 bg-green-600 text-white rounded-md w-full sm:w-[150px] ${
              sending || verifying
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-green-700"
            }`}
          >
            {sending ? "Sending..." : "Send OTP"}
          </button>

          {otpSent && (
            <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="border px-3 py-2 rounded-md w-full sm:w-[120px]"
              />
              <button
                onClick={verifyOTP}
                disabled={verifying || sending}
                className={`px-4 py-2 bg-yellow-600 text-white rounded-md ${
                  verifying || sending
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-yellow-700"
                }`}
              >
                {verifying ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
