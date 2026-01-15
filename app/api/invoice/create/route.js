import { connectDB } from "@/lib/db";
import Invoice from "@/models/invoice/Invoice";
import Customer from "@/models/Customer";
import { createAuditLog } from "@/utils/createAuditLog";
import { getAuthUser } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";

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

    // 1️⃣ FIND CUSTOMER
    const findCustomer = await Customer.findById(data.clientId);
    if (!findCustomer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer with the provided clientId not found",
        },
        { status: 404 }
      );
    }

    // 2️⃣ CREATE INVOICE
    const invoice = await Invoice.create(data);

    // 4️⃣ CREATE AUDIT HISTORY
    const { _id } = await createAuditLog({
      clientId: invoice.clientId, // 🔗 important
      entityType: "Invoice",
      entityId: invoice._id,
      action: "CREATE",
      oldData: null,
      newData: invoice.toObject(),
      userId: authUser._id,
    });

    // 3️⃣ LINK INVOICE TO CUSTOMER
    findCustomer.invoices.push(invoice._id);
    findCustomer.history.push(_id);
    await findCustomer.save();

    return NextResponse.json(
      {
        success: true,
        message: "Invoice created successfully!",
        data: invoice,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE INVOICE API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invoice error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
