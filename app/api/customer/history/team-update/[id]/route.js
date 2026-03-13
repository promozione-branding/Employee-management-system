import { connectDB } from "@/lib/db";
import TeamUpdate from "@/models/employee/TeamUpdate";
import { NextResponse } from "next/server";
import Customer from "@/models/admin/Customer";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const teamUpdate = await TeamUpdate.find({ clientId: id }).populate({
      path: "createdBy",
      select: "username email",
    });

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
