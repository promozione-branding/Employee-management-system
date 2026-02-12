import { connectDB } from "@/lib/db";
import SalesWork from "@/models/employee/sales/SalesWork";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { employeeId, meetingUpdate } = body;

    if (!employeeId || !meetingUpdate) {
      return NextResponse.json(
        {
          success: false,
          message: "employeeId and meetingUpdate are required",
        },
        { status: 400 }
      );
    }

    const meetingUpdatesItem = Array.isArray(meetingUpdate)
      ? meetingUpdate
      : [meetingUpdate];

    let employeeSalesWork = await SalesWork.findOne({ employeeId });

    if (!employeeSalesWork) {
      // Create new document
      employeeSalesWork = await SalesWork.create({
        employeeId,
        meetingUpdate: meetingUpdatesItem,
      });
    } else {

      // Push new updates into existing document
      employeeSalesWork.meetingUpdate.push(...meetingUpdatesItem);


      await employeeSalesWork.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Meeting update saved successfully",
        data: employeeSalesWork,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("SalesWork POST Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
