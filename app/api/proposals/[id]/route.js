import { connectDB } from "@/lib/db";
import Proposal from "@/models/admin/proposal/Proposal";
import Customer from "@/models/admin/Customer";
import { createAuditLog } from "@/utils/createAuditLog";
import { getAuthUser } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const proposal = await Proposal.findById(id);

    if (!proposal) {
      return Response.json(
        { success: false, message: "Proposal not found" },
        { status: 404 },
      );
    }

    return Response.json(
      {
        success: true,
        data: proposal,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("GET Proposal by ID Error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // 🔐 AUTH USER
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // 🔍 FIND PROPOSAL FIRST (IMPORTANT)
    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return NextResponse.json(
        { success: false, message: "Proposal not found" },
        { status: 404 },
      );
    }

    // 🧾 BEFORE SNAPSHOT
    const oldData = proposal.toObject();

    // 🗑 DELETE PROPOSAL
    await Proposal.findByIdAndDelete(id);

    // 📝 CREATE AUDIT HISTORY
    const { _id } = await createAuditLog({
      clientId: proposal.clientId, // 👈 VERY IMPORTANT
      entityType: "Proposal",
      entityId: proposal._id,
      action: "DELETE",
      oldData,
      newData: null,
      userId: authUser._id,
    });

    const customer = await Customer.findById(proposal.clientId);
    if (customer) {
      customer.history.push(_id);
      customer.proposals.pull(proposal._id);
      await customer.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Proposal deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE Proposal Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

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
        { status: 401 },
      );
    }

    // 🔍 FIND PROPOSAL
    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return NextResponse.json(
        { success: false, message: "Proposal not found" },
        { status: 404 },
      );
    }

    // 🧾 BEFORE SNAPSHOT
    const oldData = proposal.toObject();

    // 🔄 UPDATE FIELDS
    Object.keys(body).forEach((key) => {
      proposal[key] = body[key] ?? proposal[key];
    });

    const updatedProposal = await proposal.save();

    // 📝 CREATE AUDIT HISTORY
    const { _id } = await createAuditLog({
      clientId: proposal.clientId, // VERY IMPORTANT
      entityType: "Proposal",
      entityId: proposal._id,
      action: "UPDATE",
      oldData,
      newData: updatedProposal.toObject(),
      userId: authUser._id,
    });

    const customer = await Customer.findById(proposal.clientId);
    if (customer) {
      customer.history.push(_id);
      await customer.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Proposal updated successfully",
        data: updatedProposal,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Edit Proposal API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while editing the proposal",
      },
      { status: 500 },
    );
  }
}
