import { connectDB } from "@/lib/db";
import TeamUpdate from "@/models/employee/TeamUpdate";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const teamUpdate = await TeamUpdate.find()
      .populate({ path: "clientId", select: "name" })
      .sort({ createdAt: -1 })
      .limit(10);

    if (!teamUpdate) {
      return NextResponse.json(
        {
          success: false,
          message: "Error while fetching",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: teamUpdate,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
