import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import { createAuditLog } from "@/utils/createAuditLog";
import { getAuthUser } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: customer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Get customer by id Error", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message: `${customer?.name} customer deleted successfull`,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Delete by id api:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let findCustomer = await Customer.findById(id);
    if (!findCustomer) {
      return NextResponse.json(
        { message: "customer does not exist", success: false },
        { status: 404 }
      );
    }

    // 🧾 BEFORE SNAPSHOT
    const oldData = findCustomer.toObject();

    // 🔄 Update fields
    Object.keys(body).forEach((key) => {
      if (key in findCustomer) {
        findCustomer[key] = body[key] ?? findCustomer[key];
      }
    });

    // 📝 HISTORY
    const createAuditLogId = await createAuditLog({
      clientId: id,
      entityType: "Customer",
      entityId: findCustomer._id,
      action: "UPDATE",
      oldData,
      newData: findCustomer.toObject(),
      userId: authUser._id,
    });

    console.log(createAuditLogId?._id, "createAuditLogId");

    findCustomer.history.push(createAuditLogId?._id);

    const editedCustomer = await findCustomer.save();

    return NextResponse.json({
      success: true,
      message: "customer edit successfully",
      data: editedCustomer,
    });
  } catch (error) {
    console.log("Edit by id api:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
