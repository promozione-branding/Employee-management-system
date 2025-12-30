import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendLoginOTP } from "@/service/auth/otp/mailer";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  user.loginOTP = otp;
  user.loginOTPExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
  await user.save();

  await sendLoginOTP(email, otp);

  return NextResponse.json({
    success: true,
    message: "OTP sent successfully",
  });
}
