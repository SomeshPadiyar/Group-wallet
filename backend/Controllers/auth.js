import User from "../Models/userModel.js";
import jwt from "jsonwebtoken";
import { sendOtp, verifyOtpCode } from "../utils/otpService.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Step 1: Send OTP
export const sendOtpController = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone required" });

  const otpSent = await sendOtp(phone);
  if (otpSent) res.json({ success: true, message: "OTP sent" });
  else res.status(500).json({ success: false, message: "OTP sending failed" });
};

// Step 2: Verify OTP
export const verifyOtpController = async (req, res) => {
  const { phone, otp } = req.body;
  const verified = await verifyOtpCode(phone, otp);
  if (!verified) return res.status(400).json({ message: "Invalid OTP" });

  let user = await User.findOne({ phone });
  if (!user) user = await User.create({ phone });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ success: true, user, token });
};