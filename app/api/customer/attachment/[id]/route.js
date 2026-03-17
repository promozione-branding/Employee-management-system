import { connectDB } from "@/lib/db";
import Attachment from "@/models/admin/Attachments";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const {id} = await params
    const clientAttachment = await Attachment.find({clientId:id});

    if(!clientAttachment){
        return NextResponse.json({
            success:false,
            message:"there is no attachment"
        },{
            status:400
        })
    }

    return NextResponse.json({
      success: true,
      message: "Success attachment fetched",
      data:clientAttachment
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Server error"
    }, { status: 500 });
  }
}