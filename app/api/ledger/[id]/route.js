import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Ledger from "@/models/admin/Ledger";
import Proposal from "@/models/admin/proposal/Proposal";
import { getAuthUser } from "@/lib/getAuthUser";
import { createAuditLog } from "@/utils/createAuditLog";
import Customer from "@/models/admin/Customer";

export async function GET(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    const findLedger = await Ledger.findById(id).populate({
      path: "proposalIds",
    });

    if (!findLedger) {
      return NextResponse.json(
        {
          message: "Ledger does not exists",
          success: false,
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ledger details fetched successfully",
        data: findLedger,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      {
        status: 500,
      },
    );
  }
}

// export async function PUT(req, context) {
//   try {
//     await connectDB();

//     const { id } = await context.params;
//     const { entriesData, proposalId } = await req.json();

//     const updatedLedger = await Ledger.findByIdAndUpdate(
//       id,
//       {
//         $push: { entries: entriesData, proposalIds: proposalId },
//       },
//       { new: true }
//     );

//     if (!updatedLedger) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Ledger not found",
//         },
//         {
//           status: 404,
//         }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Entry added successfully",
//       data: updatedLedger,
//     });
//   } catch (error) {
//     console.log(error);
//     return NextResponse.json({
//       success: false,
//       message: "Server error while adding entry",
//     });
//   }
// }

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { entriesData, proposalId } = await req.json();

    // 🔐 AUTH USER
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // 🧾 FIND LEDGER
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return NextResponse.json(
        { success: false, message: "Ledger not found" },
        { status: 404 },
      );
    }

    // 🧾 BEFORE SNAPSHOT
    const oldData = ledger.toObject();

    // 🔄 UPDATE LEDGER
    ledger.entries.push(entriesData);

    if (proposalId) {
      ledger.proposalIds.push(proposalId);
    }

    const updatedLedger = await ledger.save();

    // 🧾 CREATE AUDIT HISTORY
    const auditLog = await createAuditLog({
      clientId: ledger.customerId,
      entityType: "Ledger",
      entityId: ledger._id,
      action: "UPDATE",
      oldData,
      newData: updatedLedger.toObject(),
      userId: authUser._id,
    });

    // 🔗 PUSH HISTORY INTO CUSTOMER
    const customer = await Customer.findById(ledger.customerId);
    if (customer && auditLog?._id) {
      customer.history.push(auditLog._id);
      await customer.save();
    }

    return NextResponse.json({
      success: true,
      message: "Ledger entry added successfully",
      data: updatedLedger,
    });
  } catch (error) {
    console.error("Ledger update error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while adding ledger entry",
      },
      { status: 500 },
    );
  }
}
