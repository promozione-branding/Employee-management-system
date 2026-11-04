// app/api/proposalNew/route.js

import { connectDB } from "@/lib/db";
import ProposalNew from "@/models/admin/proposalNew/ProposalNew";
import { getAuthUser } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";

const round0 = (n) => Math.round(Number(n) || 0);

export async function GET(req) {
  try {
    await connectDB();
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    if (!clientId) return NextResponse.json({ success: false, message: "clientId required" }, { status: 400 });
    const list = await ProposalNew.find({ clientId }).populate({ path: "salesExecutive", select: "basicDetails.name" }).populate({ path: "clientId", select: "name company phone email GSTIN tanNo Address city state country pincode" }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: list }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { clientId, items = [], discountType = "amount", discountInput = 0, tdsApplicable = false, partialPayments = [], deliveryPeriod = "weekly", deliveredMetrics = [], checklist = [], categoryNotes = [], cityPages = [], notes, validTill, paymentMethod } = body;

    if (!clientId) return NextResponse.json({ success: false, message: "clientId required" }, { status: 400 });
    if (!items.length) return NextResponse.json({ success: false, message: "At least one item required" }, { status: 400 });

    const subtotal = round0(items.reduce((s, it) => s + Number(it.amount || 0), 0));
    const totalServiceDiscount = round0(items.reduce((s, it) => s + Number(it.serviceDiscount || 0), 0));
    const globalDiscountAmount = discountType === "percentage" ? round0((subtotal * Number(discountInput || 0)) / 100) : round0(discountInput || 0);
    const discountAmount = round0(totalServiceDiscount + globalDiscountAmount);
    const baseAfterDiscount = round0(subtotal - discountAmount);
    const gstAmount = round0(baseAfterDiscount * 0.18);
    const tdsAmount = tdsApplicable ? round0(baseAfterDiscount * 0.02) : 0;
    const grandTotal = round0(baseAfterDiscount + gstAmount - tdsAmount);

    const totalPartial = round0(partialPayments.reduce((s, p) => s + Number(p.paymentAmount || 0), 0));
    if (grandTotal > 0 && totalPartial !== grandTotal) return NextResponse.json({ success: false, message: `Partial payments must sum to ₹${grandTotal}. Remaining: ₹${grandTotal - totalPartial}` }, { status: 400 });

    const doc = await ProposalNew.create({
      clientId,
      salesExecutive: authUser._id,
      items,
      partialPayments,
      deliveryPeriod,
      deliveredMetrics,
      checklist,
      categoryNotes,
      cityPages,
      subtotal,
      gstRate: 0.18,
      gstAmount,
      tdsApplicable,
      tdsRate: 0.02,
      tdsAmount,
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
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
