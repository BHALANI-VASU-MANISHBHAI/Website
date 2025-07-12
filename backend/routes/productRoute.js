import express from 'express';
import { addProduct, getBestSellers, getLowStockProduct, listProducts, MostSellerToday, removeProduct, singleProduct, updateProduct } from '../controllers/productController.js';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../middleware/multer.js';
const productRouter = express.Router();

// upload.fields is used to upload multiple files with different field names
productRouter.post('/add',  upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), addProduct);

productRouter.get('/list', listProducts);
productRouter.post('/remove',adminAuth, removeProduct);
productRouter.get('/single/:id', singleProduct);
productRouter.post('/update/:id', adminAuth, upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), updateProduct);  
productRouter.get('/getLowStock',adminAuth,getLowStockProduct);
productRouter.get('/mostSellerToday', MostSellerToday);
productRouter.get('/bestsellers', getBestSellers); // Get best-selling products
export default productRouter;
