import { NextResponse } from "next/server";
import User from "@/models/admin/User";
import {connectDB} from "@/lib/db";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req) {
  try {
    await connectDB();

    const { email } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail(
      email,
      "Password Reset OTP",
      `<h3>Your password reset OTP is:</h3>
       <h1>${otp}</h1>
       <p>This OTP will expire in 10 minutes.</p>`,
    );

    return NextResponse.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
