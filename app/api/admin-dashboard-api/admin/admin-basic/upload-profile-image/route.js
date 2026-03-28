import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File  required" },
        { status: 400 },
      );
    }

    // ✅ Validate type
    const allowedTypes = ["image/"];
    const isValidType = allowedTypes.some((type) => file.type.startsWith(type));

    if (!isValidType) {
      return NextResponse.json(
        { success: false, message: "Only images allowed" },
        { status: 400 },
      );
    }

    // ✅ Size limit (5MB for profile)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "Max 5MB allowed" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const fileName = `profile/${Date.now()}-${file.name}`;

    // ✅ Upload to R2
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUD_FLARE_R2_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    const url = `${process.env.CLOUD_FLARE_R2_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 },
    );
  }
}
