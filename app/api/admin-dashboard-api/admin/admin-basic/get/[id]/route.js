import { connectDB } from "@/lib/db";
import AdminBasicDetail from "@/models/admin/adminDetails/AdminBasicDetail";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const adminDetail = await AdminBasicDetail.findOne({ userId: id });

    if (!adminDetail) {
      return NextResponse.json({
        success: false,
        message: "admin details not found",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: adminDetail,
        adminDetail: Boolean(adminDetail),
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

// 📌 UPDATE
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();
    const { id } = await params;

    const updated = await AdminBasicDetail.findByIdAndUpdate(id, body, {
      new: true,
    });

    return NextResponse.json(
      {
        success: true,
        data: updated,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// 📌 DELETE
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    await AdminBasicDetail.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
