import { connectDB } from "@/lib/db";
import User from "@/models/admin/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    const user = await User.findOne({ email });
    if (!user || user.loginOTP !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (user.loginOTPExpiry < new Date()) {
      return NextResponse.json(
        { success: false, message: "OTP expired" },
        { status: 400 }
      );
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "60m" }
    );

    // Clear OTP after success
    user.loginOTP = null;
    user.loginOTPExpiry = null;
    await user.save();

    const res = NextResponse.json({
      success: true,
      message: "Login success",
      token,
    });
    res.cookies.set("token", token, {
      httpOnly: true,
      maxAge: 60 * 60,
    });

    return res;
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
