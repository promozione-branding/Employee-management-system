import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/db";
import User from "@/models/admin/User";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    await connectDB();

    // ✅ FIND EMPLOYEE BY USER ID (CORRECT)
    const adminDetails = await User.findOne({
      role: "admin",
      _id: payload.id,
    }).select("username email role");

    if (!adminDetails) {
      return NextResponse.json(
        { success: false, message: "adminDetails not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: adminDetails,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
