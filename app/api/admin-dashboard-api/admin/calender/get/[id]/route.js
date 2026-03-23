import { connectDB } from "@/lib/db";
import AdminCalendar from "@/models/admin/adminDetails/AdminCalender";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "User Id is required",
        },
        {
          status: 400,
        },
      );
    }

    const getCalender = await AdminCalendar.findOne({
      userId: id,
    }).lean();

    if (!getCalender) {
      return NextResponse.json(
        {
          success: false,
          message: "there is no Calender found",
        },
        { status: 404 },
      );
    }

    // 🗓️ Current month + year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 🎯 Filter only current month events
    const filteredCalendar = getCalender.calendar.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    });

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: {
          ...getCalender,
          calendar: filteredCalendar,
        },
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
