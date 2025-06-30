import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";

//function for adding a product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      subCategory,
      sizes,
      bestSeller,
      discount,
      originalPrice,
      stock,
    } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (image) => image !== undefined
    );

    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      images.map(async (image) => {
        const result = await cloudinary.uploader.upload(image.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    const productData = {
      name,
      price,
      description,
      category,
      subCategory,
      sizes: JSON.parse(sizes),
      bestSeller: bestSeller === "true" ? true : false,
      image: imageUrls,
      date: Date.now(),
      discount: discount ? parseFloat(discount) : 0,
      originalPrice: originalPrice ? parseFloat(originalPrice) : 0,
      stock: JSON.parse(stock),
    };

    console.log(productData);

    // ✅ First save product to DB
    const product = await productModel.create(productData);
    await product.save();

    // ✅ Then emit to socket with the saved product (which now has _id)
    const io = req.app.get("io");
    io.emit("productAdded", { product, message: "New product added" });
    
    res
      .status(200)
      .json({ success: true, message: "Product added successfully", product });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//function for list of products

const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({}).sort({ updatedAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

//function for removing a product

const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    // Emit product removal event to all users viewing this product
    const io = req.app.get("io");
    // Example: In your delete product route
    io.emit("productDeleted", {
      productId: req.body.id,
      message: "Product deleted successfully",
    });
    req.app.get("io").to("adminRoom").emit("updateStats");
    res.json({ success: true, message: "Product removed successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

//function for  single product info
const singleProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productModel.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const existingProduct = await productModel.findById(productId);

    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const {
      name,
      price,
      description,
      category,
      subCategory,
      sizes,
      bestseller,
      discount,
      originalPrice,
      stock,
    } = req.body;
    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    const newImages = [image1, image2, image3, image4].filter(
      (image) => image !== undefined
    );

    let imageUrls = existingProduct.image;

    if (newImages.length > 0) {
      const uploadedUrls = await Promise.all(
        newImages.map(async (image) => {
          const result = await cloudinary.uploader.upload(image.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
      imageUrls = uploadedUrls;
    }

    console.log("Stock Data:", stock);
    const productData = {
      name,
      price,
      description,
      category,
      subCategory,
      sizes: JSON.parse(sizes),
      bestseller: bestseller === "true",
      image: imageUrls,
      date: Date.now(),
      discount: discount ? parseFloat(discount) : 0,
      originalPrice: originalPrice ? parseFloat(originalPrice) : 0,
      stock: JSON.parse(stock), // Parse the stock data from the request body
    };

    // ✅ First update the product
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      productData,
      { new: true }
    );

    console.log("updatedProduct ", updatedProduct);

    // ✅ Then emit updated product to the room
    const io = req.app.get("io");
    io.to(productId.toString()).emit("productUpdated", {
      productId,
      product: updatedProduct, // ✅ Send the updated product
      message: "Product has been updated",
    });
    req.app.get("io").to("adminRoom").emit("updateStats");
    res
      .status(200)
      .json({
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getLowStockProduct = async (req, res) => {
  try {
    const lowStockProducts = await productModel
      .find({
        "stock.quantity": { $lte: 5, $gt: 0 },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, products: lowStockProducts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const MostSellerToday = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's non-cancelled orders
    const ordersToday = await orderModel.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "Cancelled" },
    });

    const productSalesMap = {};

    ordersToday.forEach((order) => {
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

    // Convert object to array and sort by quantity
    const sortedProducts = Object.values(productSalesMap).sort(
      (a, b) => b.quantity - a.quantity
    );

    res.json({
      success: true,
      mostSellingProducts: sortedProducts.slice(0, 5), // top 5 selling
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: "Error fetching most selling products",
    });
  }
};

const getBestSellers = async (req, res) => {
  try {
    const bestSellers = await productModel.find({}).sort({ totalSales: -1 }).limit(10);
    console.log("Best Sellers:", bestSellers);
    res.json({
      success: true,
      products: bestSellers,
    });
  } catch (error) {
    console.error("Best Seller fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch best sellers" });
  }
};

export {
  addProduct,
  listProducts,
  removeProduct,
  singleProduct,
  updateProduct,
  getLowStockProduct,
  MostSellerToday,
  getBestSellers
};
