import { connectDB } from "@/lib/db";
import AdminBasicDetail from "@/models/admin/adminDetails/AdminBasicDetail";
import { NextResponse } from "next/server";


export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const data = await AdminBasicDetail.create(body);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}