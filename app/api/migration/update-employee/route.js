import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";

export async function GET() {
  try {
    await connectDB();

    const result = await Employee.updateMany(
      {
        $or: [
          { "basicDetails.resignedEmployee": { $exists: false } },
          { "basicDetails.resignedDate": { $exists: false } },
        ],
      },
      {
        $set: {
          "basicDetails.resignedEmployee": false,
          "basicDetails.resignedDate": null,
        },
      }
    );

    return NextResponse.json({
      success: true,
      updatedEmployees: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}