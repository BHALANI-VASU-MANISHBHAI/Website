import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import connectDB from './mongodb.js';

const updateProducts = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('❌ Error updating products:', error);
  } finally {
    mongoose.disconnect();
  }
};

export default updateProducts;