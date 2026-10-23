// app/api/customer/[id]/edit-history/[entryId]/route.js

import { NextResponse } from "next/server";
import EditHistory from "@/models/admin/EditHistory";
import { connectDB as dbConnect } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id: customerId, entryId } = await params;

    const doc = await EditHistory.findOne({
      _id: entryId,
      clientId: customerId,
      isConfidential: { $ne: true },
    }).lean();

    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
