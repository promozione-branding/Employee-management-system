import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { success: false, message: "Domain is required" },
        { status: 400 }
      );
    }

    const employees = await Employee.find({
      "basicDetails.designation": domain,
    }).select("employeeId basicDetails.name");

    if (!employees.length) {
      return NextResponse.json(
        { success: false, message: "No employees found for this domain" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: employees },
      { status: 200 }
    );
  } catch (error) {
    console.log("EMPLOYEE BY DOMAIN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
