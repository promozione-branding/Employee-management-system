import { connectDB } from "@/lib/db";
import Proposal from "@/models/admin/proposal/Proposal";
import Customer from "@/models/admin/Customer";
import { createAuditLog } from "@/utils/createAuditLog";
import { getAuthUser } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";
import Service from "@/models/admin/proposal/Proposal";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const proposal = await Proposal.findById(id).select("-ledgerEntry -discount -discountPercentage");

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

// without history 
// export async function PUT(req, { params }) {
//   try {
//     await connectDB();

//     const { id } = await params;
//     const body = await req.json();

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: "Proposal ID is required" },
//         { status: 400 },
//       );
//     }

//     // 🧠 Remove fields you don't want to update
//     delete body.proposalNo;
//     delete body.createdAt;
//     delete body.updatedAt;


//     const updatedProposal = await Proposal.findByIdAndUpdate(
//       id,
//       {
//         $set: body,
//       },
//       {
//         new: true,
//         runValidators: true,
//       },
//     );

//     if (!updatedProposal) {
//       return NextResponse.json(
//         { success: false, message: "Proposal not found" },
//         { status: 404 },
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Proposal updated successfully",
//         data: updatedProposal,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Server error",
//       },
//       { status: 500 },
//     );
//   }
// }

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

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Proposal ID is required" },
        { status: 400 }
      );
    }

    // 🧠 Remove restricted fields
    delete body.proposalNo;
    delete body.createdAt;
    delete body.updatedAt;

    // 🔍 1. FETCH OLD DATA (VERY IMPORTANT)
    const existingProposal = await Proposal.findById(id);
    if (!existingProposal) {
      return NextResponse.json(
        { success: false, message: "Proposal not found" },
        { status: 404 }
      );
    }

    const oldData = existingProposal.toObject();

    // ✏️ 2. UPDATE
    const updatedProposal = await Proposal.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    // 🆕 3. NEW DATA SNAPSHOT
    const newData = updatedProposal.toObject();

    // 📝 4. CREATE AUDIT LOG (ONLY IF CHANGES EXIST)
    const auditLog = await createAuditLog({
      clientId: updatedProposal.clientId,
      entityType: "Proposal",
      entityId: updatedProposal._id,
      action: "UPDATE",
      oldData,
      newData,
      userId: authUser._id,
    });

    // 🔗 5. LINK HISTORY TO CUSTOMER (if changes happened)
    if (auditLog?._id) {
      await Customer.findByIdAndUpdate(updatedProposal.clientId, {
        $push: { history: auditLog._id },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Proposal updated successfully",
        data: updatedProposal,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE Proposal Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
