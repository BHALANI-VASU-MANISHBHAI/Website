import { useContext, useEffect, useMemo, useState } from "react";
import assets from "../assets/assets.js";
import { RiderContext } from "../contexts/RiderContext";
import RiderCodInfoCard from "../components/RiderCodInfoCard.jsx";

const RiderCodInfo = () => {
  const { riderOrders } = useContext(RiderContext);
  const [RiderOrders, setRiderOrders] = useState([]);
  const [groupedRiders, setGroupedRiders] = useState({});
  const [totalCodAmount, setTotalCodAmount] = useState(0);
  const [totalSubmittedCod, setTotalSubmittedCod] = useState(0);
  const [totalRemainingCod, setTotalRemainingCod] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [codRangeFilter, setCodRangeFilter] = useState("all");
  const [codDoneFilter, setCodDoneFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7");
  const [customStartDate, setCustomStartDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // Default to today
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // Default to today
  const [orderSearchMap, setOrderSearchMap] = useState({});
  useEffect(() => {
    // Initialize custom date range to last 7 days
    setRiderOrders(riderOrders);
    console.log("Rider Orders:", riderOrders);
  }, [riderOrders]);
  const filterOrdersByDateRange = (orders) => {
    if (dateRange === "all") return orders;

    const now = new Date();
    let start;

    if (dateRange === "7") {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
    } else if (dateRange === "30") {
      start = new Date(now);
      start.setDate(start.getDate() - 30);
    } else if (dateRange === "custom" && customStartDate && customEndDate) {
      start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0); // Set to start of day
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999); // Set to end of day
      return orders.filter((order) => {
        const created = new Date(order.acceptedTime);
        return created >= start && created <= end;
      });
    }

    return orders.filter((order) => new Date(order.createdAt) >= start);
  };

  useEffect(() => {
    if (!RiderOrders || RiderOrders.length === 0) return;

    const filteredOrders = filterOrdersByDateRange(RiderOrders);
    const map = {};

    for (const order of filteredOrders) {
      const rider = order.riderId;

      // ❌ Skip if not COD or cancelled
      if (
        !rider ||
        !rider._id ||
        order.paymentMethod !== "COD" ||
        order.status === "Cancelled"
      )
        continue;

      if (!map[rider._id]) {
        map[rider._id] = {
          riderInfo: rider,
          orders: [],
          collected: 0,
          submitted: rider.codSubmittedMoney || 0,
        };
      }

      const collected = order.earning?.collected || 0;
      map[rider._id].orders.push(order);
      map[rider._id].collected += collected;
    }

    const groupedArray = Object.values(map);
    console.log("Grouped Riders:", groupedArray);
    const totalCOD = groupedArray.reduce((sum, r) => sum + r.collected, 0);
    const totalSubmitted = groupedArray.reduce(
      (sum, r) => sum + r.submitted,
      0
    );
    const totalRemaining = totalCOD - totalSubmitted;

    setGroupedRiders(map);
    setTotalCodAmount(totalCOD);
    setTotalSubmittedCod(totalSubmitted);
    setTotalRemainingCod(totalRemaining);
  }, [RiderOrders, dateRange, customStartDate, customEndDate]);

  const filteredRiders = useMemo(() => {
    return Object.entries(groupedRiders).filter(([_, data]) => {
      const { riderInfo, collected, submitted } = data;
      const name = riderInfo.name?.toLowerCase() || "";
      const phone = riderInfo.phone?.toLowerCase() || "";

      const codAmount = collected;
      const submittedAmount = submitted;
      const remaining = codAmount - submittedAmount;

      return (
        (searchTerm === "" ||
          name.includes(searchTerm.toLowerCase()) ||
          phone.includes(searchTerm.toLowerCase())) &&
        (statusFilter === "all" || riderInfo.riderStatus === statusFilter) &&
        (codRangeFilter === "all" ||
          (codRangeFilter === "<500" && codAmount < 500) ||
          (codRangeFilter === "500-1000" &&
            codAmount >= 500 &&
            codAmount <= 1000) ||
          (codRangeFilter === ">1000" && codAmount > 1000)) &&
        (codDoneFilter === "all" ||
          (codDoneFilter === "done" && remaining === 0) ||
          (codDoneFilter === "pending" && remaining > 0))
      );
    });
  }, [
    groupedRiders,
    debouncedSearchTerm,
    statusFilter,
    codRangeFilter,
    codDoneFilter,
  ]);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200); // 300ms debounce delay

    return () => {
      clearTimeout(handler); // cleanup
    };
  }, [searchTerm]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Rider COD Information
      </h1>

      {/* Global Summary */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-white">
        <div className="bg-blue-500 p-4 rounded-xl font-medium">
          Total COD Collected: ₹{totalCodAmount.toFixed(2)}
        </div>
        <div className="bg-green-500 p-4 rounded-xl font-medium">
          Submitted COD: ₹{totalSubmittedCod.toFixed(2)}
        </div>
        <div className="bg-red-500 p-4 rounded-xl font-medium">
          Remaining COD: ₹{totalRemainingCod.toFixed(2)}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or phone..."
          className="border px-4 py-2 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-4 py-2 rounded-md"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="notified">Notified</option>
        </select>

        <select
          value={codRangeFilter}
          onChange={(e) => setCodRangeFilter(e.target.value)}
          className="border px-4 py-2 rounded-md"
        >
          <option value="all">All COD Amounts</option>
          <option value="<500">Less than ₹500</option>
          <option value="500-1000">₹500 - ₹1000</option>
          <option value=">1000">Greater than ₹1000</option>
        </select>

        <select
          value={codDoneFilter}
          onChange={(e) => setCodDoneFilter(e.target.value)}
          className="border px-4 py-2 rounded-md"
        >
          <option value="all">All COD Status</option>
          <option value="done">Marked Done</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Date Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border px-4 py-2 rounded-md"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="custom">Custom Range</option>
          <option value="all">All Time</option>
        </select>

        {dateRange === "custom" && (
          <>
            <input
              type="date"
              value={customStartDate}
              max={customEndDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="border px-4 py-2 rounded-md"
            />
            <input
              type="date"
              value={customEndDate}
              min={customStartDate}
              max={new Date().toISOString().split("T")[0]} // Prevent future dates
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="border px-4 py-2 rounded-md"
            />
          </>
        )}
      </div>

      {/* Rider Cards */}
      {filteredRiders.length === 0 ? (
        <p className="text-center text-gray-500">No matching riders found.</p>
      ) : (
        filteredRiders.map(([riderId, data]) => {
          const riderCodAmount = data.collected;
          const riderSubmitted = data.submitted;
          const remaining = riderCodAmount - riderSubmitted;
          const latestOrder = [...data.orders].sort(
            (a, b) => new Date(b.acceptedTime) - new Date(a.acceptedTime)
          )[0];

          return (
            <div
              key={riderId}
              className="mb-8 border p-4 rounded-xl shadow-lg bg-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Rider: {data.riderInfo.name || "N/A"}
                </h2>

                {remaining === 0 ? (
                  <div className="flex items-center">
                    <p className="mr-2 text-green-600 font-medium">
                      Marked Done
                    </p>
                    <img
                      src={assets.mark_as_done}
                      alt="Marked Done"
                      className="w-6 h-6"
                    />
                  </div>
                ) : (
                  <div
                    className="flex items-center cursor-pointer hover:opacity-80"
                    onClick={() =>
                      console.log("Marking as done:", data.riderInfo._id)
                    }
                  >
                    <p className="mr-2 text-blue-600 font-medium">
                      Mark as Done
                    </p>
                    <img
                      src={assets.pending_mark || assets.mark_as_done}
                      alt="Mark as Done"
                      className="w-6 h-6"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      ? new Date(latestOrder.acceptedTime).toLocaleString(
                          "en-IN"
                        )
                      : "N/A"}
                  </p>
                </div>

                <div className="space-y-2 text-base">
                  <p>
                    <span className="font-medium">Total COD Amount:</span> ₹
                    {riderCodAmount.toFixed(2)}
                  </p>
                  <p>
                    <span className="font-medium">Submitted COD:</span> ₹
                    {riderSubmitted.toFixed(2)}
                  </p>
                  <p>
                    <span className="font-medium">Remaining COD:</span> ₹
                    {remaining.toFixed(2)}
                  </p>
                  <p className="text-gray-600">
                    Total Orders: {data.orders.length}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div>
                  <p className="font-semibold mb-2 text-base">
                    Orders Assigned:
                  </p>
                  <input
                    type="text"
                    placeholder="Search order by ID or status"
                    value={orderSearchMap[riderId] || ""}
                    onChange={(e) =>
                      setOrderSearchMap((prev) => ({
                        ...prev,
                        [riderId]: e.target.value,
                      }))
                    }
                    className="border px-3 py-1.5 rounded-md mb-4 w-full sm:w-1/2"
                  />
                </div>
                <div className="hidden sm:grid grid-cols-4 gap-3 sm:gap-20 text-sm font-semibold border-b pb-2">
                  <div>Order ID</div>
                  <div>Status</div>
                  <div>Amount</div>
                  <div className="hidden sm:block">Done</div>
                </div>

                {[...data.orders]
                  .filter((order) => {
                    const search = orderSearchMap[riderId]?.toLowerCase() || "";
                    return (
                      order._id.toLowerCase().includes(search) ||
                      order.status?.toLowerCase().includes(search)
                    );
                  })
                  .sort(
                    (a, b) =>
                      new Date(b.acceptedTime) - new Date(a.acceptedTime)
                  )
                  .map((order) => (
                    <RiderCodInfoCard key={order._id} order={order} />
                  ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default RiderCodInfo;
