import { connectDB } from "@/lib/db";
import Meeting from "@/models/meeting/Meeting";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const {
      salesPersonId,
      clientId,
      updateType,
      status,
      note,
      reminderDate,
      reminderTime,
      meetingDate,
      meetingTime,
    } = await req.json();

    if (!salesPersonId || !clientId || !updateType) {
      return NextResponse.json({
        message: "Please fill all necessary details",
        success: false,
      });
    }

    const reminderAt =
      reminderDate && reminderTime
        ? new Date(`${reminderDate}T${reminderTime}`)
        : null;

    const meetingAt =
      meetingDate && meetingTime
        ? new Date(`${meetingDate}T${meetingTime}`)
        : null;

    const newUpdate = await Meeting.create({
      salesPersonId,
      clientId,
      meetingUpdate: [
        {
          updateType,
          status,
          note,
          reminderAt,
          meetingAt,
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Meeting update successfully",
        data: newUpdate,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      {
        status: 500,
      }
    );
  }
}
