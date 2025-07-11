import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import assets from "../assets/assets";
import { GlobalContext } from "../contexts/GlobalContext";
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
  const { orderHistory, paymentHistory, fetchUserPaymentHistory } =
    useContext(OrderContext);
  console.log("Order History:", orderHistory);
  const { userData /* , fetchUserData */, } =
    useContext(UserContext); // uncomment if you have refetch
  const [userPaymentHistory, setUserPaymentHistory] = useState([]);
  const [amount, setAmount] = useState("");
  const [submitMoney, setSubmitMoney] = useState(0);
  const [riderInfo, setRiderInfo] = useState(null);


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


  // Fetch user payment history on mount
  useEffect(() => {
    setUserPaymentHistory(paymentHistory);
  }, [paymentHistory]);

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

             await fetchUserPaymentHistory(); // Refetch payment history
              // refetch user payment history
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
    <div>
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
      <div>
        <p className="text-lg font-semibold mt-8 mb-4">
          Payment History:
        </p>

        <div>
          <div className="grid  grid-cols-1  sm:grid-cols-4 gap-4 font-semibold text-gray-700 bg-gray-100 p-2 rounded hidden sm:grid">
            <div>Order ID</div>
            <div>Amount</div>
            <div>Date</div>
            <div>Status</div>
          </div>

          {userPaymentHistory.length > 0 ? (
            userPaymentHistory
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((order) => (
                <div
                  key={order._id}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 border-b bg-white"
                >
                  <div className="text-sm break-all">
                    <span className="block font-semibold sm:hidden text-gray-600 mb-1">
                      Order ID
                    </span>
                    {order._id}
                  </div>

                  <div className="text-sm">
                    <span className="block font-semibold sm:hidden text-gray-600 mb-1">
                      Amount
                    </span>
                    ₹{order.amount}
                  </div>

                  <div className="text-sm">
                    <span className="block font-semibold sm:hidden text-gray-600 mb-1">
                      Date
                    </span>
                    {new Date(order.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                    {" (" +
                      new Date(order.date).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) +
                      ")"}
                  </div>

                  <div className="text-sm">
                    <span className="block font-semibold sm:hidden text-gray-600 mb-1">
                      Mark
                    </span>
                    {order.isCodSubmitted ? (
                      <img
                        src={assets.mark_as_done}
                        alt="Payment Done"
                        className="w-6 h-6 inline-block"
                      />
                    ) : (
                      <span className="text-red-500">Pending</span>
                    )}
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center text-gray-500 p-4">
              No payment history available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
