import { connectDB } from "@/lib/db";
import AdminReminder from "@/models/admin/adminDetails/AdminReminder";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

      if (!id) {
          return NextResponse.json(
            { success: false, message: "User ID is required" },
            { status: 400 },
          );
        }

    const getReminder = await AdminReminder.findOne({ userId: id })
      .select("reminder")
      .lean()

    if (!getReminder) {
      return NextResponse.json(
        {
          success: false,
          message: "there is no Reminder found",
        },
        { status: 404 },
      );
    }

    if (getReminder.reminder && Array.isArray(getReminder.reminder)) {
      getReminder.reminder.sort(
        (a, b) => new Date(b.reminderAt) - new Date(a.reminderAt),
      );
      // Limit the array to the latest 20 items
      getReminder.reminder = getReminder.reminder.slice(0, 20);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: getReminder,
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
