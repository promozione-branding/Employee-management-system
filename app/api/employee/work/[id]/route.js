
import { connectDB } from "@/lib/db";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid employee id" },
        { status: 400 }
      );
    }

    const objectId = new mongoose.Types.ObjectId(id);

    const work = await EmployeeWorkDetail.find({
      employeeId: { $in: [objectId] }, 
      checklist: {
        $elemMatch: {
          completedBy: objectId, 
        },
      },
    }).lean(); 

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: work,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
