import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } } // 300 seconds = 5 minutes
});

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;

