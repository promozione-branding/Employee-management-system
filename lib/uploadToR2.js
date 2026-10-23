// lib/uploadToR2.js
// Cloudflare R2 uploader — env names match this project.

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

const R2_ACCOUNT_ID         = process.env.CLOUD_FLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID      = process.env.CLOUD_FLARE_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY  = process.env.CLOUD_FLARE_SECRET_ACCESS_KEY;
const R2_BUCKET             = process.env.CLOUD_FLARE_R2_BUCKET;
const R2_ENDPOINT           = process.env.CLOUD_FLARE_R2_ENDPOINT
  || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_PUBLIC_URL         = process.env.CLOUD_FLARE_R2_PUBLIC_URL;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.warn("[uploadToR2] Missing R2 env vars");
}

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

function splitName(name = "") {
  const m = name.match(/^(.*?)(\.[a-zA-Z0-9]+)?$/);
  const base = (m?.[1] || "file").trim();
  const ext = (m?.[2] || "").toLowerCase();
  return { base, ext };
}

// keep letters, digits, dash, underscore; replace the rest with "-"
function slug(s) {
  return s
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "file";
}

/**
 * Upload a File to R2 and return its public URL.
 * Key shape:  <folder>/<originalName>-<timestamp>-<nanoid><ext>
 * @param {File} file
 * @param {string} folder e.g. "brand-assets/logos"
 * @returns {Promise<string>} public URL
 */
export async function uploadToR2(file, folder = "brand-assets") {
  if (!file) throw new Error("No file provided");

  const { base, ext } = splitName(file.name || "file");
  const friendly = slug(base);
  const key = `${folder}/${friendly}-${Date.now()}-${nanoid(8)}${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    })
  );

  const baseUrl = (R2_PUBLIC_URL || "").replace(/\/$/, "");
  return `${baseUrl}/${key}`;
}
