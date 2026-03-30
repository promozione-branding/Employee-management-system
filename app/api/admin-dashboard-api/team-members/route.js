import { connectDB } from "@/lib/db";
import AdminBasicDetail from "@/models/admin/adminDetails/AdminBasicDetail";
import Employee from "@/models/employee/Employee";
import { NextResponse } from "next/server";
import User from "@/models/admin/User";

export async function GET(req) {
  try {
    await connectDB();

    const teamMember = await Employee.find({"basicDetails.resignedEmployee": false}).select(
      "basicDetails.name basicDetails.profileImage basicDetails.designation  _id",
    );
    // const AdminMember = await AdminBasicDetail.find().populate({path:"userId",select:"username"});

    // const {profileImage} = AdminMember;

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: teamMember,
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
