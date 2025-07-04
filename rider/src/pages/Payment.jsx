import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { GlobalContext } from "../contexts/GlobalContext";
import { toast } from "react-toastify";
import { OrderContext } from "../contexts/OrderContext";
import { UserContext } from "../contexts/UserContext";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Payment = () => {
  const { backendUrl, token } = useContext(GlobalContext);
  const { orderHistory ,paymentHistory } = useContext(OrderContext);
  const { userData /* , fetchUserData */ } = useContext(UserContext); // uncomment if you have refetch

  const [amount, setAmount] = useState("");
  const [submitMoney, setSubmitMoney] = useState(0);

  const totalCollectedMoney = () => {
    if (!orderHistory || orderHistory.length === 0) return 0;

    let total = orderHistory.reduce((sum, order) => {
      if (order.paymentMethod === "COD") {
        return sum + (order.earning?.collected || 0);
      }
      return sum;
    }, 0);

    total -= userData?.codSubmittedMoney || 0;
    return total < 0 ? 0 : total;
  };


  // const 
  useEffect(() => {
    if (
      !orderHistory ||
      orderHistory.length === 0 ||
      !userData ||
      typeof userData.codSubmittedMoney === "undefined"
    )
      return;

    const total = totalCollectedMoney();
    setSubmitMoney(total);
    setAmount(total.toString());
    toast.info(`Total collected money: ₹${total}`);
  }, [orderHistory, userData]);

  const handleSubmit = async () => {
    const numericAmount = Math.round(Number(amount));

    if (!numericAmount || numericAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error("Failed to load Razorpay");
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/rider/createRiderCODOrder`,
        { amount: numericAmount },
        { headers: { token } }
      );

      const { key, razorpayOrder } = res.data;

      const options = {
        key,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "COD Collection",
        description: "Submit collected COD",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${backendUrl}/api/rider/verifyRiderCODPayment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: numericAmount,
              },
              {
                headers: { token },
              }
            );

            if (verifyRes.data.success) {
              toast.success("COD submitted successfully!");
              setAmount("");
              setSubmitMoney(0);
              // Optional: Refresh data
              // fetchUserData?.();
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (err) {
            toast.error(err.response?.data?.message || "Verification error.");
            console.error("Verification error:", err);
          }
        },
        prefill: {
          name: "Rider",
        },
        theme: {
          color: "#0d6efd",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        toast.error("Payment failed. Please try again.");
        console.error("Payment failed:", response.error);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Submit COD Payment</h2>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        min={1}
        max={submitMoney}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={handleSubmit}
        disabled={
          !amount ||
          isNaN(amount) ||
          Number(amount) <= 0 ||
          Number(amount) > submitMoney
        }
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full disabled:bg-gray-400"
      >
        Submit via Razorpay
      </button>
    </div>
  );
};

export default Payment;
