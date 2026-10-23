// app/api/customer/brand-assets/[clientId]/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import ClientBrandAsset from "@/models/admin/ClientBrandAsset";
import mongoose from "mongoose";

const WRITE_ROLES = ["admin", "manager"];

function sanitizeStringArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((v) => typeof v === "string" && v.trim())
    .map((v) => v.trim());
}

function sanitizePhone(v) {
  if (v == null) return "";
  return String(v).replace(/\D/g, "");
}

// Accept: ["url", { url, description }] -> [{ url, description }]
function sanitizeFiles(arr) {
  // Accept: string JSON, array, or mixed
  if (typeof arr === "string") {
    try { arr = JSON.parse(arr); } catch { arr = []; }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => {
      if (typeof item === "string") {
        // could itself be a JSON-encoded object, or a bare URL
        const t = item.trim();
        if (t.startsWith("{")) {
          try {
            const o = JSON.parse(t);
            return { url: String(o.url || "").trim(),
                     description: String(o.description || "").trim() };
          } catch { return null; }
        }
        return { url: t, description: "" };
      }
      if (item && typeof item === "object" && item.url) {
        return {
          url: String(item.url).trim(),
          description: typeof item.description === "string"
            ? item.description.trim()
            : "",
        };
      }
      return null;
    })
    .filter((x) => x && x.url);
}

/* ================= GET (any authenticated user) ================= */
export async function GET(req, { params }) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { clientId } = await params;
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid clientId" },
        { status: 400 }
      );
    }

    const doc = await ClientBrandAsset.findOne({ clientId }).lean();

    // Normalize legacy bare-string files for the UI
    const norm = doc
      ? {
          ...doc,
          logos: (doc.logos || []).map((x) =>
            typeof x === "string"
              ? { url: x, description: "" }
              : { url: x.url, description: x.description || "" }
          ),
          products: (doc.products || []).map((x) =>
            typeof x === "string"
              ? { url: x, description: "" }
              : { url: x.url, description: x.description || "" }
          ),
        }
      : null;

    return NextResponse.json({
      success: true,
      data: norm,
      canEdit: WRITE_ROLES.includes(authUser.role),
    });
  } catch (error) {
    console.error("BRAND ASSET GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/* ================= PUT (admin / manager only) ================= */
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    if (!WRITE_ROLES.includes(authUser.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const { clientId } = await params;
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid clientId" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const primaryPhone = sanitizePhone(body.primaryPhone);
    const secondaryPhone = sanitizePhone(body.secondaryPhone);

    if (primaryPhone && !/^\d{10}$/.test(primaryPhone)) {
      return NextResponse.json(
        { success: false, message: "Primary phone must be 10 digits" },
        { status: 400 }
      );
    }
    if (secondaryPhone && !/^\d{10}$/.test(secondaryPhone)) {
      return NextResponse.json(
        { success: false, message: "Secondary phone must be 10 digits" },
        { status: 400 }
      );
    }

    const update = {
      primaryPhone,
      secondaryPhone,
      websites: sanitizeStringArray(body.websites),
      maidIds: sanitizeStringArray(body.maidIds).map((e) => e.toLowerCase()),
      logos: sanitizeFiles(body.logos),
      products: sanitizeFiles(body.products),
      updatedBy: authUser._id,
    };

    let doc = await ClientBrandAsset.findOne({ clientId });
    if (!doc) {
      doc = new ClientBrandAsset({ clientId, ...update });
    } else {
      doc.primaryPhone = update.primaryPhone;
      doc.secondaryPhone = update.secondaryPhone;
      doc.websites = update.websites;
      doc.maidIds = update.maidIds;
      doc.logos = update.logos;
      doc.products = update.products;
      doc.updatedBy = update.updatedBy;
      doc.markModified("logos");
      doc.markModified("products");
    }
    await doc.save();

    return NextResponse.json({
      success: true,
      message: "Brand assets saved",
      data: doc.toObject(),
    });
  } catch (error) {
    console.error("BRAND ASSET PUT ERROR:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
