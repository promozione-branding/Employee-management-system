// lib/uploadToR2.js
// Cloudflare R2 uploader — env names match this project.

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

// project env vars
const R2_ACCOUNT_ID         = process.env.CLOUD_FLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID      = process.env.CLOUD_FLARE_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY  = process.env.CLOUD_FLARE_SECRET_ACCESS_KEY;
const R2_BUCKET             = process.env.CLOUD_FLARE_R2_BUCKET;
const R2_ENDPOINT           = process.env.CLOUD_FLARE_R2_ENDPOINT
  || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_PUBLIC_URL         = process.env.CLOUD_FLARE_R2_PUBLIC_URL; // e.g. https://pub-xxxx.r2.dev

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.warn(
    "[uploadToR2] Missing R2 env vars — CLOUD_FLARE_ACCOUNT_ID / CLOUD_FLARE_ACCESS_KEY_ID / CLOUD_FLARE_SECRET_ACCESS_KEY / CLOUD_FLARE_R2_BUCKET"
  );
}

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

function safeExt(name = "") {
  const m = name.match(/\.([a-zA-Z0-9]+)$/);
  return m ? `.${m[1].toLowerCase()}` : "";
}

/**
 * Upload a File to R2 and return its public URL.
 * @param {File} file
 * @param {string} folder e.g. "brand-assets/logos"
 * @returns {Promise<string>} public URL
 */
export async function uploadToR2(file, folder = "brand-assets") {
  if (!file) throw new Error("No file provided");

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${folder}/${Date.now()}-${nanoid(8)}${safeExt(file.name)}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    })
  );

  const base = (R2_PUBLIC_URL || "").replace(/\/$/, "");
  return `${base}/${key}`;
}
