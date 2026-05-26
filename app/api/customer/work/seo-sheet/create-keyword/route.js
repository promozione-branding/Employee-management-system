import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Keyword from "@/models/employee/seoEmployee/Keyword";
import SeoSheet from "@/models/employee/seoEmployee/SeoSheet";


export async function POST(req) {
  try {
    await connectDB();
    const { projectId, clientId, keyword, type } = await req.json();
    // console.log(website)
    const newKeyword = await Keyword.create({ keyword, type, projectId });

    await SeoSheet.findOneAndUpdate(
      { clientId },
      {
        $addToSet: { keywords: newKeyword._id },
      },
      {
        upsert: true,
        new: true,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Keyword created",
        data: newKeyword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}