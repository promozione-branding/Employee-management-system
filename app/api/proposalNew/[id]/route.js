import { connectDB } from "@/lib/db";
import ProposalNew from "@/models/admin/proposalNew/ProposalNew";
import { getAuthUser } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid id" },
        { status: 400 }
      );
    }

    const doc = await ProposalNew.findById(id)
      .populate({ path: "salesExecutive", select: "basicDetails.name" })
      .populate({
        path: "clientId",
        select:
          "name company phone email GSTIN tanNo Address city state country pincode",
      });

    if (!doc)
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, data: doc }, { status: 200 });
  } catch (error) {
    console.log("getProposalNew error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid id" },
        { status: 400 }
      );
    }

    await ProposalNew.findByIdAndDelete(id);
    return NextResponse.json(
      { success: true, message: "Deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.log("deleteProposalNew error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
