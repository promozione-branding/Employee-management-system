// app/api/customer/[id]/edit-history/meta/route.js

import { NextResponse } from "next/server";
import EditHistory from "@/models/admin/EditHistory";
import { connectDB as dbConnect } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id: customerId } = await params;

    const base = { clientId: customerId, isConfidential: { $ne: true } };

    const [modules, roles, actions] = await Promise.all([
      EditHistory.distinct("module", base),
      EditHistory.distinct("performedByRole", base),
      EditHistory.distinct("action", base),
    ]);

    return NextResponse.json({
      success: true,
      data: { modules, roles, actions },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
