import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import connectDB from './mongodb.js';

const updateProducts = async () => {
  try {
    await connectDB();

    await Product.updateMany(
      {},
      [
        { $set: { originalPrice: { $multiply: [0.6, "$price"] } } }
      ]
    );

    console.log('✅ Products updated successfully.');
  } catch (error) {
    console.error('❌ Error updating products:', error);
  } finally {
    mongoose.disconnect();
  }
};

export default updateProducts;