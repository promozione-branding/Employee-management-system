

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");

    // ❌ No file
    if (!file) {
      return NextResponse.json(
        { success: false, message: "File is required" },
        { status: 400 }
      );
    }

    // ✅ File validation (optional but recommended)
    const allowedTypes = [
      "image/",
      "video/",
      "application/pdf",
    ];

    const isValidType = allowedTypes.some((type) =>
      file.type.startsWith(type)
    );

    if (!isValidType) {
      return NextResponse.json(
        { success: false, message: "Invalid file type" },
        { status: 400 }
      );
    }

    // ❗ File size limit (example: 20MB)
    const MAX_SIZE = 20 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "File too large (max 20MB)" },
        { status: 400 }
      );
    }

    // ✅ Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // ✅ Clean filename
    const cleanName = file.name.replace(/\s+/g, "-").toLowerCase();

    const fileName = `${Date.now()}-${cleanName}`;

    // ✅ Upload to R2
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUD_FLARE_R2_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // ✅ Public URL
    const url = `${process.env.CLOUD_FLARE_R2_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({
      success: true,
      url,
    });

  } catch (error) {
    console.error("R2 UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
      },
      { status: 500 }
    );
  }
}