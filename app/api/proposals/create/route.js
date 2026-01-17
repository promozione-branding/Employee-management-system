import { connectDB } from "@/lib/db";
import Proposal from "@/models/admin/Proposal";
import Customer from "@/models/admin/Customer";
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

    // 🆕 CREATE PROPOSAL
    const proposal = await Proposal.create(data);

    if (!proposal) {
      return NextResponse.json({
        success: false,
        message: "Error while creating the proposal",
      });
    }

    // 🔎 FIND CUSTOMER
    const customer = await Customer.findById(proposal.clientId);
    if (!customer) {
      return NextResponse.json({
        success: false,
        message: "Customer not found",
      });
    }

    // 🧾 CREATE AUDIT HISTORY (PROPOSAL)
    const createAuditLogId = await createAuditLog({
      clientId: proposal.clientId,
      entityType: "Proposal",
      entityId: proposal._id,
      action: "CREATE",
      oldData: null,
      newData: proposal.toObject(),
      userId: authUser._id,
    });

    // 🔗 LINK PROPOSAL TO CUSTOMER
    customer.proposals.push(proposal._id);
    customer.history.push(createAuditLogId?._id);
    await customer.save();

    return NextResponse.json(
      {
        success: true,
        message: "Proposal created successfully",
        data: proposal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PROPOSAL API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
