// utils/otpService.js
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
const otpStore = {}; // Temporary in-memory store; use Redis for production

// Generate random 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

// Send OTP
export const sendOtp = async (phone) => {
  try {
    const otp = generateOtp();
    otpStore[phone] = otp;

    // Send via Twilio SMS
    await client.messages.create({
      body: `Your verification code is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`, // for Indian numbers
    });

    console.log(`✅ OTP sent to ${phone}: ${otp}`);
    return true;
  } catch (error) {
    console.error("❌ OTP send error:", error);
    return false;
  }
};

// Verify OTP
export const verifyOtpCode = async (phone, otp) => {
  if (otpStore[phone] && otpStore[phone] == otp) {
    delete otpStore[phone]; // remove once verified
    return true;
  }
  return false;
};