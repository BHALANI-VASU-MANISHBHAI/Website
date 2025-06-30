import React, { useEffect, useContext, useState } from "react";
import { toast } from "react-toastify";
import { OrderContext } from "../contexts/OrderContext";
import { GlobalContext } from "../contexts/GlobalContext";
import axios from "axios";

const Orders = () => {
  const { currentOrder, setCurrentOrder } = useContext(OrderContext);
  const { backendUrl, token } = useContext(GlobalContext);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (currentOrder) {
      console.log("📦 Current order:", currentOrder);
    }
  }, [currentOrder]);

  const sendOTP = async () => {
    setSending(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/send-delivery-otp`,
        { orderId: currentOrder._id }
      );

      if (response.data.success) {
        setOtpSent(true);
        toast.success("OTP sent successfully!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("❌ Failed to send OTP");
      console.error("Error sending OTP:", error);
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
        { orderId: currentOrder._id, otp }
      );

      if (response.data.success) {
        toast.success("✅ OTP verified successfully!");
        setCurrentOrder(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("❌ Failed to verify OTP");
      console.error("Error verifying OTP:", error);
    } finally {
      setVerifying(false);
    }
  };

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
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <div className="border rounded-lg shadow-md p-4 space-y-4">
        <h2 className="text-xl font-semibold text-blue-600">🧾 Order Details</h2>
        <p><strong>Total Amount:</strong> ₹{amount}</p>
        <p><strong>Delivery Charge:</strong> ₹{earning.amount}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Payment Method:</strong> {paymentMethod}</p>
        <p><strong>Payment Status:</strong> {paymentStatus}</p>
        <p><strong>Order Date:</strong> {new Date(date).toLocaleString()}</p>

        <hr />

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-700">🏠 Delivery Address:</h3>
            <p>{address.firstName} {address.lastName}</p>
            <p>{address.street}, {address.city}, {address.state} - {address.zipcode}</p>
            <p>{address.country}</p>
            <p><strong>Phone:</strong> {address.phone}</p>
            <p><strong>Email:</strong> {address.email}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-700">🏭 Pickup Address:</h3>
            <p>{pickUpAddress.street}, {pickUpAddress.city}, {pickUpAddress.state} - {pickUpAddress.pincode}</p>
            <p>{pickUpAddress.country}</p>
            <a
              href={`https://www.google.com/maps?q=${pickUpLocation.lat},${pickUpLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Pickup Location on Map
            </a>
          </div>
        </div>

        <hr />

        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center sm:justify-end">
          <button
            onClick={sendOTP}
            disabled={sending}
            className={`px-4 py-2 bg-green-600 text-white rounded-md w-full sm:w-[150px] transition ${sending ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"}`}
          >
            {sending ? "Sending..." : "Send OTP"}
          </button>

          {otpSent && (
            <div className="flex gap-2 w-full sm:w-auto items-center">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="border px-3 py-2 rounded-md w-full sm:w-[120px]"
              />
              <button
                onClick={verifyOTP}
                disabled={verifying}
                className={`px-4 py-2 bg-yellow-600 text-white rounded-md transition ${verifying ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-700"}`}
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
