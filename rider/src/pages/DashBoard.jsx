import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { GlobalContext } from "../contexts/GlobalContext";
import { OrderContext } from "../contexts/OrderContext";
import { UserContext } from "../contexts/UserContext";
import socket from "../services/socket";

const Dashboard = () => {
  const { userData } = useContext(UserContext);
  const { backendUrl, token, currentLocation } = useContext(GlobalContext);
  const { setCurrentOrder } = useContext(OrderContext);

  const [orderData, setOrderData] = useState(null);
  const [timer, setTimer] = useState(null);
  const [distance, setDistance] = useState(0);
  const [eta, setEta] = useState(null);
  const [riderAmount, setRiderAmount] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [
    distanceFromPickupToCurrentLocation,
    setDistanceFromPickupToCurrentLocation,
  ] = useState(null);
  const [timeFromPickupToCurrentLocation, setTimeFromPickupToCurrentLocation] =
    useState(null);

  const [
    distanceFromPickupToDeliveryLocation,
    setDistanceFromPickupToDeliveryLocation,
  ] = useState(null);
  const [
    timeFromPickupToDeliveryLocation,
    setTimeFromPickupToDeliveryLocation,
  ] = useState(null);

  const countdownRef = useRef(null);

  const calculateDistanceAndTime = async (
    from,
    to,
    setDistanceFn,
    setTimeFn
  ) => {
    try {
      const url = `https://us1.locationiq.com/v1/directions/driving/${
        from.lng
      },${from.lat};${to.lng || to.longitude},${
        to.lat || to.latitude
      }?key=pk.231231dbbc3adaf8b1d5637c69074b32&overview=false&steps=false`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const km = route.distance / 1000;
        const timeInMin = Math.ceil(route.duration / 60);
        setDistanceFn(km);
        setTimeFn(timeInMin);
      }
    } catch (err) {
      console.error("Error calculating distance/time:", err);
    }
  };

  const startCountdown = (order) => {
    if (!order.expiresAt) return;
    const expiresAt = new Date(order.expiresAt).getTime();
    const now = Date.now();
    const secondsLeft = Math.floor((expiresAt - now) / 1000);
    if (secondsLeft <= 0) return;

    setTimer(secondsLeft);
    countdownRef.current = setInterval(() => {
      const remaining = Math.floor(
        (new Date(order.expiresAt).getTime() - Date.now()) / 1000
      );
      if (remaining < 0) return;
      if (remaining == 1) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        toast.error("⏰ Time expired. You didn't accept the order.");
        localStorage.removeItem("activeOrder");
        setOrderData(null);
        setTimer(null);
        return;
      } else {
        setTimer(remaining);
      }
    }, 1000);
  };

  useEffect(() => {
    const saved = localStorage.getItem("activeOrder");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOrderData(parsed);
        startCountdown(parsed);
        calculateDistanceAndTime(
          parsed.pickUpLocation,
          parsed.address,
          setDistance,
          setEta
        );
      } catch {
        localStorage.removeItem("activeOrder");
      }
    }

    const handleNewOrder = (data) => {
      const fullOrder = data.ORDER;
      console.log("New order received:", fullOrder);
      setOrderData(fullOrder);
      localStorage.setItem("activeOrder", JSON.stringify(fullOrder));
      startCountdown(fullOrder);
      setRiderAmount(fullOrder.earning.amount);
      // Estimate pickup → delivery
      calculateDistanceAndTime(
        fullOrder.pickUpLocation,
        fullOrder.address,
        setDistanceFromPickupToDeliveryLocation,
        setTimeFromPickupToDeliveryLocation
      );

      // Estimate rider current location → pickup
      if (currentLocation && fullOrder.pickUpLocation) {
        calculateDistanceAndTime(
          currentLocation,
          fullOrder.pickUpLocation,
          setDistanceFromPickupToCurrentLocation,
          setTimeFromPickupToCurrentLocation
        );
      }

      // Calculate total route distance
      calculateDistanceAndTime(
        fullOrder.pickUpLocation,
        fullOrder.address,
        setDistance,
        setEta
      );
    };

    socket.on("order:rider:notification", handleNewOrder);
    return () => {
      socket.off("order:rider:notification", handleNewOrder);
      clearInterval(countdownRef.current);
    };
  }, [currentLocation]);

  const handleAcceptOrder = async (orderId) => {
    if (isAccepting) return;
    setIsAccepting(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/rider/acceptOrder`,
        {
          orderId,
          distanceFromPickUpLocation: distanceFromPickupToCurrentLocation,
          distanceFromDeliveryLocation: distanceFromPickupToDeliveryLocation,
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(`✅ Order accepted! You will earn ₹${riderAmount}`);
        clearInterval(countdownRef.current);
        localStorage.removeItem("activeOrder");
        setTimer(null);
        setCurrentOrder(orderData);
        setOrderData(null);
      } else {
        toast.error(response.data.message);
      }
    } catch {
      toast.error("❌ Failed to accept order");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleCancelOrder = () => {
    if (isCancelling) return;
    setIsCancelling(true);
    clearInterval(countdownRef.current);
    countdownRef.current = null;
    localStorage.removeItem("activeOrder");
    setOrderData(null);
    setTimer(null);
    toast.info("Order cancelled.");
    setIsCancelling(false);
  };

  if (!userData) return <p>Loading user data...</p>;
  if (!orderData) return <p>No active orders at the moment.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, Rider</h1>
      <p className="text-lg">Hello, {userData.name}!</p>
      <p className="text-sm text-gray-500 mb-6">
        Status: {userData.riderStatus}
      </p>

      <div className="mt-6 p-4 border rounded-xl bg-white shadow-lg space-y-3">
        <h2 className="text-xl font-semibold text-blue-700">Order Details</h2>
        <p>Rider Amount (Delivery Charge): ₹{orderData.earning.amount}</p>
        <p>
          Payment Method:{" "}
          {orderData.paymentMethod === "COD" ? "Cash on Delivery" : "Online"}
        </p>
        <p>
          {orderData.paymentMethod === "COD"
            ? `Total Amount: ₹${orderData.amount}`
            : null}
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-between mt-4">
          <div className="w-full md:w-1/2">
            <h3 className="font-semibold text-green-700">Pickup Location</h3>
            <p>
              {orderData.pickUpAddress?.street}, {orderData.pickUpAddress?.city}
              , {orderData.pickUpAddress?.state} -{" "}
              {orderData.pickUpAddress?.pincode}
            </p>
            <a
              href={`https://www.google.com/maps?q=${orderData.pickUpLocation.lat},${orderData.pickUpLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Pickup on Map
            </a>
            {currentLocation && orderData.pickUpLocation && (
              <a
                href={`https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${orderData.pickUpLocation.lat},${orderData.pickUpLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline block mt-2"
              >
                🧭 Get Directions to Pickup
              </a>
            )}

            <iframe
              title="Pickup Map"
              width="100%"
              height="300"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
              src={`https://maps.google.com/maps?q=${orderData.pickUpLocation.lat},${orderData.pickUpLocation.lng}&z=15&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <h3 className="font-semibold text-purple-700 mt-4">
              Delivery Location
            </h3>
            <p>
              {orderData.address?.street}, {orderData.address?.city},{" "}
              {orderData.address?.state} - {orderData.address?.zipcode}
            </p>
            <a
              href={orderData.address?.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Delivery on Map
              {currentLocation && orderData.address && (
                <a
                  href={`https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${orderData.address.latitude},${orderData.address.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline block mt-2"
                >
                  🧭 Get Directions to Delivery
                </a>
              )}
            </a>
            <iframe
              title="Delivery Map"
              width="100%"
              height="300"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
              src={`https://maps.google.com/maps?q=${orderData.address.latitude},${orderData.address.longitude}&z=15&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <p className="text-indigo-600 font-medium mt-2">
          Total Distance:{" "}
          {distanceFromPickupToCurrentLocation !== null &&
          distanceFromPickupToDeliveryLocation !== null
            ? (
                distanceFromPickupToCurrentLocation +
                distanceFromPickupToDeliveryLocation
              ).toFixed(2)
            : distance.toFixed(2)}{" "}
          km
        </p>

        <p className="text-indigo-600 font-medium mt-2">
          Total Estimated Time:{" "}
          {timeFromPickupToCurrentLocation !== null &&
          timeFromPickupToDeliveryLocation !== null
            ? timeFromPickupToCurrentLocation + timeFromPickupToDeliveryLocation
            : eta}{" "}
          min
        </p>

        {distanceFromPickupToCurrentLocation !== null && (
          <p className="text-yellow-600">
            📍 Distance to Pickup:{" "}
            {distanceFromPickupToCurrentLocation.toFixed(2)} km
            {timeFromPickupToCurrentLocation &&
              ` (~${timeFromPickupToCurrentLocation} min)`}
          </p>
        )}

        {distanceFromPickupToDeliveryLocation !== null && (
          <p className="text-pink-600">
            🚚 Distance Pickup ➝ Delivery:{" "}
            {distanceFromPickupToDeliveryLocation.toFixed(2)} km
            {timeFromPickupToDeliveryLocation &&
              ` (~${timeFromPickupToDeliveryLocation} min)`}
          </p>
        )}

        <p className="text-red-600 font-semibold mt-2">Time left: {timer}s</p>

        <div className="mt-4 flex flex-col md:flex-row md:justify-end gap-2 w-full">
          <button
            disabled={isAccepting}
            className={`w-full md:w-auto px-4 py-2 text-white rounded-md transition ${
              isAccepting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={() => handleAcceptOrder(orderData._id)}
          >
            {isAccepting ? "Accepting..." : "Accept Order"}
          </button>
          <button
            disabled={isCancelling}
            className={`w-full md:w-auto px-4 py-2 rounded-md transition ${
              isCancelling
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-300 hover:bg-gray-400 text-gray-800"
            }`}
            onClick={handleCancelOrder}
          >
            {isCancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
