import { connectDB } from "@/lib/db";
import ProposalNew from "@/models/admin/proposalNew/ProposalNew";
import { getAuthUser } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    if (!clientId)
      return NextResponse.json(
        { success: false, message: "clientId required" },
        { status: 400 }
      );

    const list = await ProposalNew.find({ clientId })
      .populate({ path: "salesExecutive", select: "basicDetails.name" })
      .populate({
        path: "clientId",
        select:
          "name company phone email GSTIN tanNo Address city state country pincode",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: list }, { status: 200 });
  } catch (error) {
    console.log("listProposalNew error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const body = await req.json();
    const {
      clientId,
      items = [],
      discountType = "amount",
      discountInput = 0,
      partialPayments = [],
      deliveryPeriod = "weekly",
      deliveredMetrics = [],
      checklist = [],
      notes,
      validTill,
      paymentMethod,
    } = body;

    if (!clientId)
      return NextResponse.json(
        { success: false, message: "clientId required" },
        { status: 400 }
      );
    if (!items.length)
      return NextResponse.json(
        { success: false, message: "At least one item required" },
        { status: 400 }
      );

    const subtotal = items.reduce((s, it) => s + Number(it.amount || 0), 0);
    const gstAmount = Number((subtotal * 0.18).toFixed(2));

    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = Number(
        ((subtotal * Number(discountInput || 0)) / 100).toFixed(2)
      );
    } else {
      discountAmount = Number(discountInput || 0);
    }

    if (discountAmount > subtotal + gstAmount) {
      return NextResponse.json(
        { success: false, message: "Discount cannot exceed total" },
        { status: 400 }
      );
    }

    const grandTotal = Number(
      (subtotal + gstAmount - discountAmount).toFixed(2)
    );

    const totalPartial = partialPayments.reduce(
      (s, p) => s + Number(p.paymentAmount || 0),
      0
    );
    if (totalPartial > grandTotal) {
      return NextResponse.json(
        { success: false, message: "Partial payments exceed grand total" },
        { status: 400 }
      );
    }

    const doc = await ProposalNew.create({
      clientId,
      salesExecutive: authUser._id,
      items,
      partialPayments,
      deliveryPeriod,
      deliveredMetrics,
      checklist,
      subtotal,
      gstRate: 0.18,
      gstAmount,
      discountType,
      discountInput: Number(discountInput || 0),
      discountAmount,
      grandTotal,
      notes,
      validTill,
      paymentMethod,
      status: "draft",
    });

    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (error) {
    console.log("createProposalNew error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
