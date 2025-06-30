import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from "compression";
import { createServer } from 'http';
import { Server } from 'socket.io';


import connectDB from './config/mongodb.js';
import cloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import SubscriberRoute from './routes/subscriberRoute.js';
import otpRouter from './routes/otpRoute.js';
import dashboardRouter from './routes/dashBoardRoute.js';
import riderRouter from './routes/riderRoute.js';
// App Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
connectDB();
cloudinary();


const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Change this to your frontend URL for better security
    methods: ['GET', 'POST']
  }
});


app.use(compression({ threshold: 0 }));
app.use(cors());
app.use(express.json());


app.set('io', io);


app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/review', reviewRouter);
app.use('/api/subscriber', SubscriberRoute);
app.use('/api/auth', otpRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/rider', riderRouter);


app.get('/', (req, res) => {
  res.send('Hello World');
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Admin joins the global admin room
  socket.on('joinAdminRoom', () => {
    console.log('Admin joined adminRoom:', socket.id);
    socket.join('adminRoom');
  });

  // Each user joins their own unique room
  socket.on('joinUserRoom', (userId) => {
    console.log(`User ${userId} joined their room`);
    socket.join(userId);
  });

  // ✅ Product-specific room join
  socket.on('joinProductRoom', ({ productId }) => {
    console.log(`User ${socket.id} joined product room ${productId}`);
    socket.join(productId.toString());
  });

  // ✅ Product-specific room leave
  socket.on('leaveProductRoom', ({ productId }) => {
    console.log(`User ${socket.id} left product room ${productId}`);
    socket.leave(productId.toString());
  });
  socket.on('joinStockRoom', () => {
  console.log('User joined stockRoom:', socket.id);
  socket.join('stockRoom');
});

socket.on('leaveStockRoom', () => {
  console.log('User left stockRoom:', socket.id);
  socket.leave('stockRoom');
});
  socket.on("joinRiderRoom", (riderId) => {
    console.log(`Rider ${riderId} joined riderRoom`);
    socket.join("riderRoom");
  });

  socket.on("leaveRiderRoom", (riderId) => {
    console.log(`Rider ${riderId} left riderRoom`);
    socket.leave("riderRoom");
  });

  socket.on("joinSingleRiderRoom", (riderId) => {
    console.log(`Rider ${riderId} joined single room`);
    socket.join(`riderRoom-${riderId}`);
  });

  socket.on("leaveSingleRiderRoom", (riderId) => {
    console.log(`Rider ${riderId} left single room`);
    socket.leave(`riderRoom-${riderId}`);
  });

  socket.on('joinStockRoom', () => {
    console.log('User joined stockRoom:', socket.id);
    socket.join('stockRoom');
  });
  
  socket.on('leaveStockRoom', () => {
    console.log('User left stockRoom:', socket.id);
    socket.leave('stockRoom');
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });


});


// Start the HTTP server (not app.listen)
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
