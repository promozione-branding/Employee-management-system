import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const workDetail = await EmployeeWorkDetail.findById(id);

    if (!workDetail) {
      return NextResponse.json(
        {
          success: false,
          message: "work details not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "success work details fetched",
      data: workDetail,
    });
    
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      { status: 500 },
    );
  }
}
