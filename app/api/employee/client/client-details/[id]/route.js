import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";
import ProjectCycle from "@/models/admin/ProjectCycle";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const clientDetails = await Customer.findById(id)
      .select(
        "-meetingDate -salesPersonEmail -SalesPersonName -salesExecutive -notes -invoices -proposals -history -workDetails",
      )
      .populate({path:"projectCycle",select:"projectDuration"});

    return NextResponse.json(
      {
        success: true,
        message: "Success client details fetched",
        data: clientDetails,
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
