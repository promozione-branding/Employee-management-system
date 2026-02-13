import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    
    return NextResponse.json(
      {
        success: true,
        message: "Success",
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
