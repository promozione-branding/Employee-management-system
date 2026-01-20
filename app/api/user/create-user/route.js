import { NextResponse } from "next/server";
import User from "@/models/admin/User";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { username, email, role, password } = await req.json();

    if (!username || !email || !role || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      role,
      password: hashedPassword,
    });

    return NextResponse.json(
      { success: true, message: "User created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      { status: 500 },
    );
  }
}
