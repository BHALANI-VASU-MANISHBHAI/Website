import { storeOTP,
    verifyOTP,resetPassword ,PhoneSentOTP, verifyPhoneOTP,  sendDeliveryOtp,
  verifyDeliveryOtp} from '../controllers/otpController.js';
import express from 'express';
import { Router } from 'express';


const otpRouter = express.Router();



// Route to request OTP
otpRouter.post('/forgot-password',storeOTP);
// Route to verify OTP
otpRouter.post('/verify-otp', verifyOTP);
// Route to reset password
otpRouter.post('/reset-password', resetPassword);
// Route to send OTP to phone
otpRouter.post('/phone-otp', PhoneSentOTP);
// Route to verify phone OTP
otpRouter.post('/verify-phone-otp', verifyPhoneOTP);
// Route to send delivery OTP
otpRouter.post('/send-delivery-otp', sendDeliveryOtp);
// Route to verify delivery OTP
otpRouter.post('/verify-delivery-otp', verifyDeliveryOtp);

export default otpRouter;