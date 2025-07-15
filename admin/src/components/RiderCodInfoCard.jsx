import assets from "../assets/assets.js";

const RiderCodInfoCard = ({ order }) => {
  return (
    <div
      key={order._id}
      className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-20 text-sm text-gray-700 py-2 border-b"
    >
      <div>
        <span className="font-medium sm:hidden">Order ID:</span> {order._id}
        <br />
        <span className="text-xs text-gray-400">
          {new Date(order.acceptedTime).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div>{order.status || "N/A"}</div>

      <div>
        <div className="flex flex- sm:flex-col  sm:items-start items-center gap-2">
          <span>₹{order.amount?.toFixed(2) || "N/A"}</span>
          <span className="text-xs text-gray-500">
            {new Date(order.riderCodCollectedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
      {order.isCodSubmitted && (
        <div className="flex  flex-row  items-center sm:items-start sm:flex-col ">
          <img src={assets.mark_as_done} alt="Done" className="w-6 h-6" />
          {order.riderCodSubmittedAt && (
            <span className="text-xs text-gray-400">
              {new Date(order.riderCodSubmittedAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default RiderCodInfoCard;
