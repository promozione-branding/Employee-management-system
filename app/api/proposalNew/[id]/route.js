import { connectDB } from "@/lib/db";
import ProposalNew from "@/models/admin/proposalNew/ProposalNew";
import { getAuthUser } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

const round0 = (n) => Math.round(Number(n) || 0);

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

export async function PUT(req, { params }) {
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

    const existing = await ProposalNew.findById(id);
    if (!existing)
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );

    const body = await req.json();
    const {
      items = [],
      discountType = "amount",
      discountInput = 0,
      tdsApplicable = false,
      partialPayments = [],
      deliveryPeriod = "weekly",
      deliveredMetrics = [],
      checklist = [],
      notes,
      validTill,
      paymentMethod,
    } = body;

    if (!items.length)
      return NextResponse.json(
        { success: false, message: "At least one item required" },
        { status: 400 }
      );

    if (Number(discountInput) < 0)
      return NextResponse.json(
        { success: false, message: "Discount cannot be negative" },
        { status: 400 }
      );

    for (const p of partialPayments) {
      if (Number(p.paymentAmount) < 0)
        return NextResponse.json(
          { success: false, message: "Partial payment cannot be negative" },
          { status: 400 }
        );
    }

    const subtotal = round0(
      items.reduce((s, it) => s + Number(it.amount || 0), 0)
    );

    const discountAmount =
      discountType === "percentage"
        ? round0((subtotal * Number(discountInput || 0)) / 100)
        : round0(discountInput || 0);

    if (discountAmount > subtotal) {
      return NextResponse.json(
        { success: false, message: "Discount cannot exceed subtotal" },
        { status: 400 }
      );
    }

    const baseAfterDiscount = round0(subtotal - discountAmount);
    const gstAmount = round0(baseAfterDiscount * 0.18);
    const tdsAmount = tdsApplicable ? round0(baseAfterDiscount * 0.02) : 0;
    const grandTotal = round0(baseAfterDiscount + gstAmount - tdsAmount);

    const totalPartial = round0(
      partialPayments.reduce((s, p) => s + Number(p.paymentAmount || 0), 0)
    );

    if (totalPartial > grandTotal) {
      return NextResponse.json(
        {
          success: false,
          message: `Partial payments (₹${totalPartial}) exceed grand total (₹${grandTotal})`,
        },
        { status: 400 }
      );
    }

    if (grandTotal > 0 && totalPartial !== grandTotal) {
      return NextResponse.json(
        {
          success: false,
          message: `Partial payments must sum to ₹${grandTotal}. Remaining: ₹${
            grandTotal - totalPartial
          }`,
        },
        { status: 400 }
      );
    }

    existing.items = items;
    existing.partialPayments = partialPayments;
    existing.deliveryPeriod = deliveryPeriod;
    existing.deliveredMetrics = deliveredMetrics;
    existing.checklist = checklist;
    existing.subtotal = subtotal;
    existing.gstRate = 0.18;
    existing.gstAmount = gstAmount;
    existing.tdsApplicable = tdsApplicable;
    existing.tdsRate = 0.02;
    existing.tdsAmount = tdsAmount;
    existing.discountType = discountType;
    existing.discountInput = Number(discountInput || 0);
    existing.discountAmount = discountAmount;
    existing.grandTotal = grandTotal;
    existing.notes = notes;
    existing.validTill = validTill;
    existing.paymentMethod = paymentMethod;

    const updated = await existing.save();

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.log("updateProposalNew error:", error);
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
