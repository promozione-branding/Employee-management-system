import { connectDB } from "@/lib/db";
import User from "@/models/admin/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const allUser = await User.find().sort({ createdAt: -1 });

    if (!allUser) {
      return NextResponse.json({
        success: false,
        message: "there is not user",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "All Users",
        data: allUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    NextResponse.json({
      success: false,
      message: "Error while Getting all user",
    });
  }
}
