import { connectDB } from "@/lib/db";
import Keyword from "@/models/employee/seoEmployee/Keyword";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    await connectDB();
    const { keywordId, rankingId, position, page } = await req.json();

    const updated = await Keyword.findOneAndUpdate(
      {
        _id: keywordId,
        "rankings._id": rankingId,
      },
      {
        $set: {
          "rankings.$.position": position,
          "rankings.$.page": page,
        },
      },
      { new: true },
    );

    return NextResponse.json({
      success: true,
      message: "Ranking updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
