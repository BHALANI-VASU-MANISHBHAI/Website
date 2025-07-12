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
  const { userData } = useContext(UserContext);

  const [amount, setAmount] = useState("");
  const [submitMoney, setSubmitMoney] = useState(0);
  const [sortBy, setSortBy] = useState("latest");
  const [expanded, setExpanded] = useState({}); // Track expanded orders

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

  useEffect(() => {
    if (!orderHistory || !userData) return;
    const total = totalCollectedMoney();
    setSubmitMoney(total);
    setAmount(total.toString());
    if (total > 0) toast.info(`Total collected money: ₹${total}`);
  }, [orderHistory, userData]);

  const handleSubmit = async () => {
    const numericAmount = Math.round(Number(amount));
    if (!numericAmount || numericAmount <= 0)
      return toast.error("Enter valid amount");

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) return toast.error("Failed to load Razorpay");

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
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${backendUrl}/api/rider/verifyRiderCODPayment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: numericAmount,
              },
              { headers: { token } }
            );
            if (verifyRes.data.success) {
              toast.success("COD submitted successfully!");
              setAmount("");
              setSubmitMoney(0);
              await fetchUserPaymentHistory();
              setSubmitMoney(totalCollectedMoney());
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (err) {
            toast.error(err.response?.data?.message || "Verification error.");
          }
        },
        prefill: { name: "Rider" },
        theme: { color: "#0d6efd" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => toast.error("Payment failed. Try again."));
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  const sortedHistory = [...paymentHistory].sort((a, b) => {
    if (sortBy === "latest")
      return new Date(b.riderCodSubmittedAt) - new Date(a.riderCodSubmittedAt);
    if (sortBy === "oldest")
      return new Date(a.riderCodSubmittedAt) - new Date(b.riderCodSubmittedAt);
    if (sortBy === "amountHigh") return b.amount - a.amount;
    if (sortBy === "amountLow") return a.amount - b.amount;
    if (sortBy === "pending")
      return Number(a.isCodSubmitted) - Number(b.isCodSubmitted);
    if (sortBy === "submitted")
      return Number(!a.isCodSubmitted) - Number(!b.isCodSubmitted);
    return 0;
  });

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
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

      <div className="mt-10 px-2">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <p className="text-lg font-semibold">Payment History</p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border px-3 py-1 rounded mt-2 sm:mt-0"
          >
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="amountHigh">Amount: High to Low</option>
            <option value="amountLow">Amount: Low to High</option>
            <option value="pending">Pending First</option>
            <option value="submitted">Submitted First</option>
          </select>
        </div>

        <div>
          {sortedHistory.length > 0 ? (
            sortedHistory.map((order) => (
              <div
                key={order._id}
                className="bg-white border rounded mb-4 p-4 space-y-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                  <div>Order ID: {order._id.slice(0, 8)}</div>
                  <div>Amount: ₹{order.amount}</div>
                  <div>
                    Date:{" "}
                    {order.riderCodSubmittedAt
                      ? new Date(order.riderCodSubmittedAt).toLocaleString(
                          "en-IN"
                        )
                      : "N/A"}
                  </div>
                  <div>
                    Status:{" "}
                    {order.isCodSubmitted ? (
                      <img
                        src={assets.mark_as_done}
                        alt="Done"
                        className="w-5 h-5 inline-block"
                      />
                    ) : (
                      <span className="text-red-500">Pending</span>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => toggleExpand(order._id)}
                      className="text-blue-600 underline"
                    >
                      {expanded[order._id] ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>

                {expanded[order._id] && (
                  <div className="mt-2 flex flex-col  sm:flex-row sm:justify-between">
                    <div className="bg-gray-50 mt-2 p-3 rounded text-sm space-y-3">
                      {order.paymentMethod && (
                        <p>
                          <strong>Payment Method:</strong> {order.paymentMethod}
                        </p>
                      )}
                      {order.paymentStatus && (
                        <p>
                          <strong>Payment Status:</strong> {order.paymentStatus}
                        </p>
                      )}
                      {order.riderCodSubmittedAt && (
                        <p>
                          <strong>Submitted At:</strong>{" "}
                          {new Date(order.riderCodSubmittedAt).toLocaleString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </p>
                      )}
                      {order.riderCodCollectedAt && (
                        <p>
                          <strong>Collected At:</strong>{" "}
                          {new Date(order.riderCodCollectedAt).toLocaleString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-50 mt-2 p-3 rounded text-sm  space-y-3">
                      <div className="">
                        <strong>Pickup Address:</strong>
                        <p>
                          {order.pickUpAddress.street},{" "}
                          {order.pickUpAddress.city},{" "}
                          {order.pickUpAddress.state} -{" "}
                          {order.pickUpAddress.pincode}
                        </p>
                      </div>
                      <div className="">
                        <strong>Delivery Address:</strong>
                        <p>
                          {order.address.street}, {order.address.city},{" "}
                          {order.address.state} - {order.address.zipcode  }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
