import ProductModel from "../models/productModel.js";
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

const MostSellerToday = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const ordersToday = await orderModel.find({
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'Cancelled' }
        });

        const productSalesMap = {};

        ordersToday.forEach(order => {
            order.items.forEach(item => {
                if (productSalesMap[item._id]) {
                    productSalesMap[item._id].quantity += item.quantity;
                } else {
                    productSalesMap[item._id] = {
                        productId: item._id,
                        name: item.name,
                        image: item.image,
                        category: item.category,
                        quantity: item.quantity
                    };
                }
            });
        });

        const sortedProducts = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity);

        res.json({
            success: true,
            mostSellingProducts: sortedProducts.slice(0, 5)
        });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'Error fetching most selling products' });
    }
};

const getMostSellingProductsByRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Date range required." });
        }   
        const { start, end } = formatDateRange(startDate, endDate);
        const orders = await orderModel.find({
            date: { $gte: start, $lte: end },
            status: { $ne: 'Cancelled' }
        });
        const productSalesMap = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (productSalesMap[item._id]) {
                    productSalesMap[item._id].quantity += item.quantity;
                } else {
                    productSalesMap[item._id] = {
                        productId: item._id,
                        name: item.name,
                        image: item.image,
                        category: item.category,
                        quantity: item.quantity
                    };
                }
            });
        });
        const sortedProducts = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity);
        res.json({
            success: true,
            mostSellingProducts: sortedProducts.slice(0, 5)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error fetching most selling products' });
    }
};


const getTotalRevenue = async (req, res) => {
    try {
        const totalRevenueData = await orderModel.aggregate([
            { $match: { status: { $ne: "Cancelled" } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalRevenue = totalRevenueData[0]?.total || 0;
        res.json({ success: true, totalRevenue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching revenue.' });
    }
};

const getTotalOrders = async (req, res) => {
    try {
        const totalOrders = await orderModel.countDocuments({ status: { $ne: "Cancelled" } });
        res.json({ success: true, totalOrders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching orders.' });
    }
};

const getTotalCustomers = async (req, res) => {
    try {
        const totalCustomers = await UserModel.countDocuments({ role: "user" });
        res.json({ success: true, totalCustomers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching customers.' });
    }
};

const getTotalRevenueByRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Date range required." });
        }

        const { start, end } = formatDateRange(startDate, endDate);

        const totalRevenueData = await orderModel.aggregate([
            { $match: { status: { $ne: "Cancelled" }, date: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalRevenue = totalRevenueData[0]?.total || 0;

        res.json({ success: true, totalRevenue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching revenue.' });
    }
};

const getProfitByRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Date range required." });
        }

        const { start, end } = formatDateRange(startDate, endDate);

        const profitData = await orderModel.aggregate([
            { $match: { status: { $ne: "Cancelled" }, date: { $gte: start, $lte: end } } },
            { $unwind: "$items" },
            {
                $project: {
                    profit: {
                        $multiply: [
                            { $subtract: ["$items.price", "$items.originalPrice"] },
                            "$items.quantity"
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalProfit: { $sum: "$profit" }
                }
            }
        ]);

        const totalProfit = profitData[0]?.totalProfit || 0;

        res.json({ success: true, totalProfit });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching profit.' });
    }
};

const getCostByRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Date range required." });
        }

        const { start, end } = formatDateRange(startDate, endDate);

        const costData = await orderModel.aggregate([
            { $match: { status: { $ne: "Cancelled" }, date: { $gte: start, $lte: end } } },
            { $unwind: "$items" },
            {
                $project: {
                    cost: {
                        $multiply: ["$items.originalPrice", "$items.quantity"]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCost: { $sum: "$cost" }
                }
            }
        ]);

        const totalCost = costData[0]?.totalCost || 0;

        res.json({ success: true, totalCost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching cost.' });
    }
};

const getOrdersByRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Date range required." });
        }

        const { start, end } = formatDateRange(startDate, endDate);

        const ordersData = await orderModel.aggregate([
            { $match: { status: { $ne: "Cancelled" }, date: { $gte: start, $lte: end } } },
            { $group: { _id: null, totalOrders: { $sum: 1 } } }
        ]);

        const totalOrders = ordersData[0]?.totalOrders || 0;

        res.json({ success: true, totalOrders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching orders.' });
    }
};

export {
    MostSellerToday,
    getTotalRevenue,
    getTotalOrders,
    getTotalCustomers,
    getTotalRevenueByRange,
    getProfitByRange,
    getCostByRange,
    getOrdersByRange,
    getMostSellingProductsByRange
};
