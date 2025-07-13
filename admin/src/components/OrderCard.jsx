import assets from "../assets/assets";

const OrderCard = ({
  orders,
  statusHandler,
  stepperSteps,
  allStatusSteps,
  currency,
}) => {
  return (
    <div className="max-w-full mt-4">
      {orders.map((order, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 border-2 border-gray-200 p-5 md:p-8 my-3 text-xs sm:text-sm md:text-base text-gray-700 bg-white rounded-md shadow-sm"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <img
              src={assets.parcel_icon}
              alt="Parcel"
              className="w-12 object-cover"
            />
            <div className="flex-1">
              <p className="mt-3 font-medium">
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <div>
                <p>
                  {order.address.street}, {order.address.city}
                </p>
                <p>
                  {order.address.state}, {order.address.country},{" "}
                  {order.address.zipcode}
                </p>
              </div>
              <p>Phone: {order.address.phone}</p>
            </div>
            <div className="flex flex-wrap gap-2 self-start flex-col">
              {order.items.map((item, idx) => (
                <span key={idx} className="text-sm">
                  {item.name} x {item.quantity} ({item.size})
                </span>
              ))}
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between w-full mt-4">
            {stepperSteps.map((step, idx) => {
              const isActive = step === order.status;
              const isCompleted = stepperSteps.indexOf(order.status) > idx;

              return (
                <div key={idx} className="flex items-center flex-1 relative">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                        ? "bg-yellow-400 border-yellow-400 text-white"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < stepperSteps.length - 1 && (
                    <div
                      className={`flex-1 h-1 ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
            <div>
              <p>Items: {order.items.length}</p>
              <p>Method: {order.paymentMethod}</p>
              <p>
                Payment:{" "}
                {order.paymentStatus === "success"
                  ? "Done"
                  : order.paymentStatus === "failed"
                  ? "Failed"
                  : "Pending"}
              </p>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>

            <div className="text-lg font-bold">
              {currency}
              {order.amount}
            </div>

            <div className="flex flex-col items-start sm:items-center gap-2">
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
                className="p-2 font-semibold border rounded-md"
              >
                {allStatusSteps.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 self-start">
                <p
                  className={`w-3 h-3 rounded-full ${
                    order.status === "Delivered"
                      ? "bg-green-500"
                      : order.status === "Cancelled"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                ></p>
                <p>{order.status}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderCard;
