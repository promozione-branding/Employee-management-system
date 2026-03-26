import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Keyword from "@/models/employee/seoEmployee/Keyword";

export async function POST(req) {
  try {
    await connectDB();
    const { keywordId, position, page, employeeID } = await req.json();

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const updated = await Keyword.findOneAndUpdate(
      {
        _id: keywordId,
        "rankings.date": {
          $not: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $push: {
          rankings: {
            date: new Date(),
            position,
            page,
            employeeID,
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          message: "Ranking already updated for today",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ranking updated",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}