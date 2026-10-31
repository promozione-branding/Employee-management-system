
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdminReminder from "@/models/admin/adminDetails/AdminReminder";
import User from "@/models/admin/User";

// IMPORTANT:
// Copy the exact getAuthUser import from:
// app/api/admin-dashboard-api/admin/reminder/clients/route.js
import { getAuthUser } from "@/lib/getAuthUser";

export async function GET(req) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);

    if (!authUser?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = authUser._id;

    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      return NextResponse.json(
        { success: false, message: "Authenticated user not found" },
        { status: 404 }
      );
    }

    const record = await AdminReminder.findOne({ userId })
      .select("reminder")
      .lean();

    const reminders = Array.isArray(record?.reminder)
      ? [...record.reminder]
          .sort(
            (a, b) =>
              new Date(b.reminderAt).getTime() -
              new Date(a.reminderAt).getTime()
          )
          .slice(0, 20)
      : [];

    return NextResponse.json({
      success: true,
      message: "Reminders fetched successfully",
      data: { reminder: reminders },
    });
  } catch (error) {
    console.error("Manager reminder GET error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);

    if (!authUser?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = authUser._id;
    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      return NextResponse.json(
        { success: false, message: "Authenticated user not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { reminder } = body;

    if (!Array.isArray(reminder) || reminder.length === 0) {
      return NextResponse.json(
        { success: false, message: "A reminder is required" },
        { status: 400 }
      );
    }

    const normalizedReminders = [];

    for (const item of reminder) {
      const description =
        typeof item?.description === "string"
          ? item.description.trim()
          : "";

      const reminderDate = new Date(item?.reminderAt);

      if (
        !description ||
        !item?.reminderAt ||
        Number.isNaN(reminderDate.getTime())
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Each reminder requires a description and a valid reminder date",
          },
          { status: 400 }
        );
      }

      normalizedReminders.push({
        description,
        reminderAt: reminderDate,
        cc_email: Array.isArray(item.cc_email) ? item.cc_email : [],
      });
    }

    const result = await AdminReminder.findOneAndUpdate(
      { userId },
      {
        $push: {
          reminder: { $each: normalizedReminders },
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Manager reminder saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Manager reminder POST error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
