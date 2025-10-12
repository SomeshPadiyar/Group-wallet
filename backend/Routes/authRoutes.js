import express from "express";
import { sendOtpController, verifyOtpController } from "../Controllers/auth.js";

const router = express.Router();

router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOtpController);
router.get("/data",(req,res)=>{
    res.json({message:"received"})
})
export default router;