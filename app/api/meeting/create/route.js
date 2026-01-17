import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Meeting from "@/models/admin/meeting/Meeting";
import Customer from "@/models/admin/Customer";

export async function POST(req) {
  try {
    await connectDB();

    const {
      salesPersonId,
      salesPerson,
      clientId,
      updateType,
      status,
      note,
      reminderAt,
      meetingAt,
    } = await req.json();

    const findCustomer = await Customer.findById(clientId);
    if (!findCustomer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer with provided clientId not found",
        },
        {
          status: 404,
        }
      );
    }

    const createMeeting = await Meeting.create({
      meetingUpdate: [
        {
          salesPersonId,
          salesPerson,
          clientId,
          updateType,
          status,
          note,
          reminderAt,
          meetingAt,
        },
      ],
    });

    if (!createMeeting) {
      throw new Error("Error while creating the meeting");
    }

    findCustomer.meetingUpdate = createMeeting?._id;
    await findCustomer.save();

    return NextResponse.json(
      {
        success: true,
        message: "meeting created successfully",
        data: createMeeting,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      { status: 500 }
    );
  }
}
