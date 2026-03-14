import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import { NextResponse } from "next/server";

export async function POST(req) {
  const data = await req.formData();
  const file = data.get("file");

  const buffer = Buffer.from(await file.arrayBuffer());

  const fileName = `${Date.now()}-${file.name}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUD_FLARE_R2_BUCKET,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    })
  );

  const url = `${process.env.CLOUD_FLARE_R2_PUBLIC_URL}/${fileName}`;

  return NextResponse.json({
    success: true,
    url,
  });
}