import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import Employee from "@/models/employee/Employee";
import Customer from "@/models/admin/Customer";

export async function GET(req, { params }) {
  try {
    await connectDB();

    // Require an authenticated user.
    const user = await getAuthUser(req);

    if (!user?._id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // Next.js dynamic route params may be asynchronous.
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid employee ID",
        },
        { status: 400 },
      );
    }

    // Ensure the requested employee belongs to the authenticated user.
    // If your existing authorization rules allow managers/admins to view
    // other employees, apply those same rules here instead.
    const employee = await Employee.findOne({
      _id: id,
      user: user._id,
    })
      .select("_id")
      .lean();

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found or access denied",
        },
        { status: 403 },
      );
    }

    const now = new Date();

    // Start of the current month, using server-local calendar time.
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );

    // Start of the current week: Monday at 00:00.
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);

    const dayOfWeek = weekStart.getDay();
    const daysSinceMonday = (dayOfWeek + 6) % 7;

    weekStart.setDate(
      weekStart.getDate() - daysSinceMonday,
    );

    const employeeObjectId = new mongoose.Types.ObjectId(id);

    // Count customers assigned to this employee and created during
    // the relevant periods.
    const [monthlyAdded, weeklyAdded] = await Promise.all([
      Customer.countDocuments({
        salesExecutive: employeeObjectId,
        createdAt: {
          $gte: monthStart,
          $lte: now,
        },
      }),

      Customer.countDocuments({
        salesExecutive: employeeObjectId,
        createdAt: {
          $gte: weekStart,
          $lte: now,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        monthlyAdded,
        weeklyAdded,
      },
    });
  } catch (error) {
    console.error("Client acquisition API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch client acquisition statistics",
      },
      { status: 500 },
    );
  }
}