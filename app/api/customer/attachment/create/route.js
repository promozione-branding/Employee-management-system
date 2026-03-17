import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import Attachment from "@/models/admin/Attachments";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      assetType,
      title,
      description,
      visibility,
      file,
      referenceLink,
      clientId,
    } = body;

    // 🔒 Basic validation
    if (!assetType) {
      return NextResponse.json(
        { success: false, message: "assetType is required" },
        { status: 400 }
      );
    }

    // at least one of file or referenceLink required
    if (!file && !referenceLink) {
      return NextResponse.json(
        { success: false, message: "file or referenceLink is required" },
        { status: 400 }
      );
    }

       const authUser = await getAuthUser(req);
        if (!authUser) {
          return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
          );
        }

    // 🆕 Create attachment
    const attachment = await Attachment.create({
      assetType,
      title,
      description,
      visibility,
      file,
      referenceLink,
      uploadedBy:authUser?._id,
      clientId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Attachment created successfully",
        data: attachment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ATTACHMENT CREATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}