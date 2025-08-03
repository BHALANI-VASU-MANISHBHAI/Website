import React from "react";

const RiderInfoCard = ({ data, latestOrder }) => {
  return (
    <div>
      {" "}
      <div className="space-y-2 text-base">
        <p>
          <span className="font-medium">Phone:</span>{" "}
          {data.riderInfo.phone || "N/A"}
        </p>
        <p>
          <span className="font-medium">Email:</span>{" "}
          {data.riderInfo.email || "N/A"}
        </p>
        <p>
          <span className="font-medium">Status:</span>{" "}
          {data.riderInfo.riderStatus || "N/A"}
        </p>
        <p>
          <span className="font-medium">Last Assigned:</span>{" "}
          {latestOrder?.acceptedTime
            ? new Date(latestOrder.acceptedTime).toLocaleString("en-IN")
            : "N/A"}
        </p>
      </div>
    </div>
  );
};

export default RiderInfoCard;
