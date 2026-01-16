import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import Customer from "@/models/Customer";
import Invoice from "@/models/invoice/Invoice";
import { createAuditLog } from "@/utils/createAuditLog";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // 🔐 AUTH USER
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let findInvoice = await Invoice.findById(id);
    if (!findInvoice) {
      return NextResponse.json(
        {
          message: "Invoice does not exits",
          success: false,
        },
        {
          status: 404,
        }
      );
    }

    // 🧾 BEFORE SNAPSHOT
    const oldData = findInvoice.toObject();

    // 🔄 UPDATE FIELDS
    Object.keys(body).forEach((key) => {
      findInvoice[key] = body[key] ?? findInvoice[key];
    });

    Object.assign(findInvoice, body);

    const editedInvoice = await findInvoice.save();

    // 📝 CREATE AUDIT HISTORY
    const { _id } = await createAuditLog({
      clientId: findInvoice?.clientId,
      entityType: "Invoice",
      entityId: findInvoice?._id,
      action: "UPDATE",
      oldData,
      newData: editedInvoice.toObject(),
      userId: authUser?._id,
    });

    const customer = await Customer.findById(findInvoice?.clientId);
    if (customer) {
      customer.history.push(_id);
      await customer.save();
    }

    return NextResponse.json({
      success: true,
      message: "Editing invoice details",
      data: editedInvoice,
    });
  } catch (error) {
    console.log("Error while editing invoice", error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    let findInvoice = await Invoice.findById(id);
    if (!findInvoice) {
      return Response.json(
        {
          message: "Invoice does not exits",
          success: false,
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      message: "Invoice details fetched successfully",
      data: findInvoice,
    });
  } catch (error) {
    console.log("Error while editing invoice", error);
    return Response.json(
      {
        success: false,
        message: "server error",
      },
      {
        status: 500,
      }
    );
  }
}
