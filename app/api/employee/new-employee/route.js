import { connectDB } from "@/lib/db";
import User from "@/models/admin/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    // Find users where the employeeId field does not exist.
    const newUsers = await User.find({
      employeeId: { $exists: false },
      role: { $ne: "admin" },
    }).select("-role -createdAt -updatedAt -__v -password");

    if (!newUsers) {
      return NextResponse.json(
        { success: false, message: "No new users found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newUsers,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      {
        status: 500,
      },
    );
  }
}
