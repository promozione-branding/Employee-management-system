import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    const checkUser = await User.findOne({ email });

    if (!checkUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User doesn't exist, please register.",
        },
        { status: 404 }
      );
    }

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser?.password
    );

    if (!checkPasswordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect password! Please try again.",
        },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        username: checkUser.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const userResponse = {
      _id: checkUser._id,
      username: checkUser.username,
      email: checkUser.email,
      role: checkUser.role,
    };

    const response = NextResponse.json({
      success: true,
      message: "User logged in successfully",
      data: userResponse,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred.",
      },
      { status: 500 }
    );
  }
}
