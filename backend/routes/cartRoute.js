import express from 'express';

import {
  addToCart,
  getUserCart,
  updateCart
} from '../controllers/cartController.js';
import restrictToRole from '../middleware/restrictToRole.js';

const cartRouter = express.Router();

cartRouter.post('/get',restrictToRole('user') , getUserCart);
cartRouter.post('/add',restrictToRole('user') ,  addToCart);
cartRouter.post('/update',restrictToRole('user') ,  updateCart);



export default cartRouter;