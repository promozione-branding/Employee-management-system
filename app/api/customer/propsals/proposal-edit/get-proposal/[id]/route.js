import { connectDB } from "@/lib/db";
import Proposal from "@/models/admin/Proposal";
import { NextResponse } from "next/server";
import Customer from "@/models/admin/Customer";
import Service from "@/models/admin/Service";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const proposal = await Proposal.findById(id).populate("services");

    if (!proposal) {
      return NextResponse.json(
        {
          success: false,
          message: "proposal not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "proposal details fetch",
      data: proposal,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      { status: 500 },
    );
  }
}

// export async function PUT(req, { params }) {
//   try {
//     await connectDB();

//     const { id } = await params;
//     const body = await req.json();

//     const updatedProposal = await Proposal.findByIdAndUpdate(
//       id,
//       {
//         $set: {
//           clientId: body.clientId,
//           clientName: body.clientName,
//           clientCompany: body.clientCompany,
//           clientAddress: body.clientAddress,
//           GSTIN: body.GSTIN,
//           tanNo: body.tanNo,
//           services: body.services,
//           discount: body.discount,
//           discountPercentage: body.discountPercentage,
//           totalAmount: body.totalAmount,
//           validTill: body.validTill,
//           paymentMethod: body.paymentMethod,
//           partlyPayment: body.partlyPayment,
//         },
//       },
//       { new: true, runValidators: true },
//     ).populate("services");

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
//       { success: false, message: "Server error" },
//       { status: 500 },
//     );
//   }
// }

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    // 🔐 AUTH
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // 🔍 FIND EXISTING PROPOSAL
    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return NextResponse.json(
        { success: false, message: "Proposal not found" },
        { status: 404 },
      );
    }

    // 🧾 OLD SNAPSHOT (for history)
    const oldData = proposal.toObject();

    // 🔄 UPDATE (FULL REPLACEMENT – PUT semantics)
    proposal.clientId = body.clientId;
    proposal.clientName = body.clientName;
    proposal.clientCompany = body.clientCompany;
    proposal.clientAddress = body.clientAddress;
    proposal.GSTIN = body.GSTIN;
    proposal.tanNo = body.tanNo;
    proposal.services = body.services;
    proposal.discount = body.discount;
    proposal.discountPercentage = body.discountPercentage;
    proposal.totalAmount = body.totalAmount;
    proposal.validTill = body.validTill;
    proposal.paymentMethod = body.paymentMethod;
    proposal.partlyPayment = body.partlyPayment;

    const updatedProposal = await proposal.save();

    // 📝 AUDIT LOG
    const { _id: historyId } = await createAuditLog({
      clientId: updatedProposal.clientId,
      entityType: "Proposal",
      entityId: updatedProposal._id,
      action: "UPDATE",
      oldData,
      newData: updatedProposal.toObject(),
      userId: authUser._id,
    });

    // 🔗 PUSH HISTORY TO CUSTOMER
    await Customer.findByIdAndUpdate(
      updatedProposal.clientId,
      { $push: { history: historyId } },
      { new: true },
    );

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
        message: "Server error while editing proposal",
      },
      { status: 500 },
    );
  }
}
