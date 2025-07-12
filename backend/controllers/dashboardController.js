import orderModel from "../models/orderModel.js";
import UserModel from "../models/userModel.js";

// Utility: To get full day range
const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getMostSellingProductsByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: "Date range required." });
    }
    const { start, end } = formatDateRange(startDate, endDate);
    const orders = await orderModel.find({
      date: { $gte: start, $lte: end },
      status: { $ne: "Cancelled" },
    });
    const productSalesMap = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (productSalesMap[item._id]) {
          productSalesMap[item._id].quantity += item.quantity;
        } else {
          productSalesMap[item._id] = {
            productId: item._id,
            name: item.name,
            image: item.image,
            category: item.category,
            quantity: item.quantity,
          };
        }
      });
    });
    const sortedProducts = Object.values(productSalesMap).sort(
      (a, b) => b.quantity - a.quantity
    );
    res.json({
      success: true,
      mostSellingProducts: sortedProducts.slice(0, 5),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching most selling products",
    });
  }
};

const getTotalCustomers = async (req, res) => {
  try {
    const totalCustomers = await UserModel.countDocuments({ role: "user" });
    res.json({ success: true, totalCustomers });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching customers." });
  }
};

const getOrdersByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: "Date range required." });
    }

    const { start, end } = formatDateRange(startDate, endDate);

    const ordersData = await orderModel.aggregate([
      {
        $match: {
          status: { $ne: "Cancelled" },
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, totalOrders: { $sum: 1 } } },
    ]);
    if (ordersData.length === 0) {
      return res.json({ success: true, totalOrders: 0 });
    }
    const totalOrders = ordersData[0]?.totalOrders || 0;

    res.json({ success: true, totalOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching orders." });
  }
};

export {
  getMostSellingProductsByRange, getOrdersByRange, getTotalCustomers
};

