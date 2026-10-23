// app/api/customer/brand-assets/upload/route.js

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { uploadToR2 } from "@/lib/uploadToR2";

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admin & manager may upload brand assets
    if (!["admin", "manager"].includes(authUser.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "brand-assets";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "file is required" },
        { status: 400 }
      );
    }

    const url = await uploadToR2(file, String(folder));

    return NextResponse.json({ success: true, url }, { status: 201 });
  } catch (error) {
    console.error("BRAND ASSET UPLOAD ERROR:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
