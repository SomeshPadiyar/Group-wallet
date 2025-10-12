// For now use dummy OTP (use Twilio or Firebase later)
const otpStore = new Map(); // phone -> otp

export const sendOtp = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore.set(phone, otp.toString());
  console.log(`OTP for ${phone} is ${otp}`); // Replace with SMS API
  return true;
};

export const verifyOtpCode = async (phone, otp) => {
  const storedOtp = otpStore.get(phone);
  if (storedOtp && storedOtp === otp) {
    otpStore.delete(phone);
    return true;
  }
  return false;
};