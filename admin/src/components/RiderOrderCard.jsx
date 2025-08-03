import React from "react";
const RiderOrderCard = React.memo(({ order }) => {
  return (
    <div className="border p-5 rounded-lg shadow bg-white flex flex-col md:flex-row justify-between items-start gap-6">
      <div className="text-sm text-gray-800 space-y-2 w-full md:w-1/2">
        <p>
          <strong>Order ID:</strong> {order._id}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Amount:</strong> ₹{order.amount}
        </p>
        <p className="flex items-center gap-2">
          <strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus}
          )
          {order.paymentMethod === "COD" && (
            <span className="ml-2 text-xs text-yellow-700 font-semibold bg-yellow-100 px-2 py-1 rounded">
              Collect Cash on Delivery
            </span>
          )}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(order.createdAt).toLocaleDateString("en-GB")}
        </p>
        <p>
          <strong>Time:</strong>{" "}
          {new Date(order.acceptedTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </p>
        <p className="text-sm font-semibold text-gray-600 border-t pt-2">
          Rider Info
        </p>
        <p>
          <strong>Name:</strong> {order.riderId?.name || "N/A"}
        </p>
        <p>
          <strong>Phone:</strong> {order.riderId?.phone || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {order.riderId?.email || "N/A"}
        </p>
        <p>
          <strong>Status:</strong> {order.riderId?.riderStatus || "N/A"}
        </p>
      </div>

      <div className="text-sm text-gray-800 w-full md:w-1/2 space-y-3">
        <p className="text-sm font-semibold text-gray-600 border-t pt-2">
          Address Info
        </p>
        <p className="font-semibold">
          Pickup Address:
          <span className="font-normal">
            {" "}
            {order.pickUpAddress?.street}, {order.pickUpAddress?.city},{" "}
            {order.pickUpAddress?.state} - {order.pickUpAddress?.pincode}
          </span>
        </p>
        <p className="font-semibold">
          Delivery Address:
          <span className="font-normal">
            {" "}
            {order.address?.firstName} {order.address?.lastName},{" "}
            {order.address?.street}, {order.address?.city},{" "}
            {order.address?.state} - {order.address?.zipcode}
          </span>
        </p>
        <p>Email: {order.address?.email}</p>
        <p>Phone: {order.address?.phone}</p>
        {order.items?.length > 0 && (
          <div>
            <p className="font-semibold text-gray-700 pt-2">Items:</p>
            <ul className="list-disc ml-6 space-y-1">
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.name} - Qty: {item.quantity} (Size: {item.size})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});
export default RiderOrderCard;
