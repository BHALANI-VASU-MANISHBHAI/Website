import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../contexts/UserContext";
import { GlobalContext } from "../contexts/GlobalContext";
import socket from "../services/socket";
import axios from "axios";
import { toast } from "react-toastify";
import { OrderContext } from "../contexts/OrderContext";
import haversine from "haversine-distance";

const Dashboard = () => {
  const { userData } = useContext(UserContext);
  const { backendUrl, token } = useContext(GlobalContext);
  const { setCurrentOrder } = useContext(OrderContext);

  const [orderData, setOrderData] = useState(null);
  const [timer, setTimer] = useState(null);
  const [distance, setDistance] = useState(0);
  const [riderAmount, setRiderAmount] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const countdownRef = useRef(null);

  const calculateDistance = (pickup, delivery) => {
    const pickupCoords = { lat: pickup.lat, lng: pickup.lng };
    const deliveryCoords = {
      lat: delivery.lat || 21.1904,
      lng: delivery.lng || 72.8517,
    };
    const dist = Math.ceil(haversine(pickupCoords, deliveryCoords) / 1000);
    setDistance(dist);
    return dist;
  };

  const calculateRiderAmount = (dist, deliveryCharge) => {
    if (dist <= 5) return deliveryCharge + dist * 10;
    else if (dist <= 10) return deliveryCharge + dist * 15;
    else return deliveryCharge + dist * 20;
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
      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        toast.error("⏰ Time expired. You didn't accept the order.");
        localStorage.removeItem("activeOrder");
        setOrderData(null);
        setTimer(null);
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
        setRiderAmount(parsed.riderAmount || 0);
        startCountdown(parsed);
      } catch (e) {
        localStorage.removeItem("activeOrder");
      }
    }

    const handleNewOrder = (data) => {
      const fullOrder = {
        ...data.existingOrder,
        expiresAt: new Date(data.expiresAt).toISOString(),
        pickUpLocation: data.pickupLocation,
        deliveryLocation: data.deliveryLocation,
        earning: {
          amount: data.riderAmount || 0,
          collected: 0,
        },
      };
      setOrderData(fullOrder);
      setRiderAmount(fullOrder.earning.amount);
      localStorage.setItem("activeOrder", JSON.stringify(fullOrder));

      const dist = calculateDistance(fullOrder.pickUpLocation, fullOrder.address);
      startCountdown(fullOrder);
    };

    socket.on("newOrder", handleNewOrder);
    return () => {
      socket.off("newOrder", handleNewOrder);
      clearInterval(countdownRef.current);
    };
  }, []);

  const handleAcceptOrder = async (orderId) => {
    if (isAccepting) return;
    setIsAccepting(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/rider/acceptOrder`,
        { orderId, riderAmount },
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
    } catch (err) {
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
      <h1 className="text-2xl font-bold mb-4">Welcome, Rider </h1>
      <p className="text-lg">Hello, {userData.name}!</p>
      <p className="text-sm text-gray-500 mb-6">Status: {userData.riderStatus}</p>

      <div className="mt-6 p-4 border rounded-xl bg-white shadow-lg space-y-3">
        <h2 className="text-xl font-semibold text-blue-700">Order Details</h2>
        <p>Rider Amount (Delivery Charge): ₹{riderAmount}</p>
        <p>Payment Method: {orderData.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}</p>

        <div className="flex flex-col md:flex-row gap-4 justify-between mt-4">
          <div className="w-full md:w-1/2">
            <h3 className="font-semibold text-green-700"> Pickup Location</h3>
            <p>
              {orderData.pickUpAddress?.street}, {orderData.pickUpAddress?.city},{" "}
              {orderData.pickUpAddress?.state} - {orderData.pickUpAddress?.pincode}
            </p>
            <a
              href={`https://www.google.com/maps?q=${orderData.pickUpLocation.lat},${orderData.pickUpLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Pickup on Map
            </a>

            <h3 className="font-semibold text-purple-700 mt-4">Delivery Location</h3>
            <p>
              {orderData.address?.street}, {orderData.address?.city},{" "}
              {orderData.address?.state} - {orderData.address?.zipcode}
            </p>
            <a
              href={`https://www.google.com/maps?q=${orderData.address.lat || 21.1904},${orderData.address.lng || 72.8517}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Delivery on Map
            </a>
          </div>
        </div>

        <p className="mt-2 text-indigo-600 font-medium">Distance: {distance} km</p>
        <p className="text-red-600 font-semibold mt-2">Time left: {timer}s</p>

        <div className="mt-4 flex flex-col md:flex-row md:justify-end gap-2 w-full">
          <button
            disabled={isAccepting}
            className={`w-full md:w-auto px-4 py-2 text-white rounded-md transition ${
              isAccepting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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
