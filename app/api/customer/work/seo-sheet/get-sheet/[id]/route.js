import { connectDB } from "@/lib/db";
import SeoSheet from "@/models/employee/seoEmployee/SeoSheet";
import { NextResponse } from "next/server";
import Keyword from "@/models/employee/seoEmployee/Keyword";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const getSeoSheet = await SeoSheet.findOne({ clientId: id }).populate({
      path: "keywords",
    });

    if (!getSeoSheet) {
      return NextResponse.json(
        {
          success: false,
          message: "there is no sheet found of client",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        data: getSeoSheet,
        success: true,
        message: "Success client seo sheet fetched",
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

