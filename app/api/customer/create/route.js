

import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/utils/createAuditLog";
import { getAuthUser } from "@/lib/getAuthUser";



export async function POST(req) {
  try {
    await connectDB();

    // 🔐 AUTH USER
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();

    // 🆕 CREATE CUSTOMER
    const newCustomer = await Customer.create(data);

    // 🧾 CREATE HISTORY (NO LINKING REQUIRED)
    await createAuditLog({
      entityType: "Customer",
      entityId: newCustomer._id,
      action: "CREATE",
      oldData: null,
      newData: newCustomer.toObject(),
      userId: authUser._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Customer created successfully",
        data: newCustomer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create customer api error", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}