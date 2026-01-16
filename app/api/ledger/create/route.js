import { connectDB } from "@/lib/db";
import Ledger from "@/models/Ledger";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { createAuditLog } from "@/utils/createAuditLog";

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

    // 🧾 FIND CUSTOMER
    const findCustomer = await Customer.findById(data.customerId);
    if (!findCustomer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer with provided customerId not found",
        },
        { status: 404 }
      );
    }

    // 🆕 CREATE LEDGER
    const newLedger = await Ledger.create(data);

    // 📝 CREATE AUDIT HISTORY
    const { _id } = await createAuditLog({
      clientId: findCustomer._id,
      entityType: "Ledger",
      entityId: newLedger._id,
      action: "CREATE",
      oldData: null,
      newData: newLedger.toObject(),
      userId: authUser._id,
    });

    // 🔗 ATTACH LEDGER TO CUSTOMER
    findCustomer.ledger = newLedger._id;
    findCustomer.history.push(_id);
    await findCustomer.save();

    return NextResponse.json(
      {
        success: true,
        message: "Ledger created successfully",
        data: newLedger,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error while creating ledger", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
