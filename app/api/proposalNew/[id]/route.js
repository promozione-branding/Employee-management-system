// app/api/proposalNew/[id]/route.js

import { connectDB } from "@/lib/db";
import ProposalNew from "@/models/admin/proposalNew/ProposalNew";
import { getAuthUser } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

const round0 = (n) => Math.round(Number(n) || 0);

// ✅ THIS IS THE FIX: GET has NO authUser check.
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
    }
    
    const doc = await ProposalNew.findById(id)
      .populate({ path: "salesExecutive", select: "basicDetails.name" })
      .populate({ path: "clientId", select: "name company phone email GSTIN tanNo Address city state country pincode" });
      
    if (!doc) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: doc }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

// PUT still needs auth (only admins can edit)
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const existing = await ProposalNew.findById(id);
    if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    const body = await req.json();
    const { items = [], discountType = "amount", discountInput = 0, tdsApplicable = false, partialPayments = [], deliveryPeriod = "weekly", deliveredMetrics = [], checklist = [], categoryNotes = [], cityPages = [], notes, validTill, paymentMethod } = body;

    const parsedItems = items.map(it => ({
      category: it.category, categoryLabel: it.categoryLabel, packageKey: it.packageKey, label: it.label,
      duration: it.duration, durationLabel: it.durationLabel, amount: Number(it.amount),
      serviceDiscount: Number(it.serviceDiscount || 0), custom: !!it.custom,
      customOfferings: it.customOfferings ? it.customOfferings.map((o) => String(o)) : [],
      cityName: it.cityName || "", cityCount: it.cityCount || "", keywordName: it.keywordName || "", keywordCount: it.keywordCount || "",
    }));

    const subtotal = round0(parsedItems.reduce((s, it) => s + it.amount, 0));
    const totalServiceDiscount = round0(parsedItems.reduce((s, it) => s + it.serviceDiscount, 0));
    const globalDiscountAmount = discountType === "percentage" ? round0((subtotal * Number(discountInput || 0)) / 100) : round0(discountInput || 0);
    const discountAmount = round0(totalServiceDiscount + globalDiscountAmount);
    const baseAfterDiscount = round0(subtotal - discountAmount);
    const gstAmount = round0(baseAfterDiscount * 0.18);
    const tdsAmount = tdsApplicable ? round0(baseAfterDiscount * 0.02) : 0;
    const grandTotal = round0(baseAfterDiscount + gstAmount - tdsAmount);

    const totalPartial = round0(partialPayments.reduce((s, p) => s + Number(p.paymentAmount || 0), 0));
    if (grandTotal > 0 && totalPartial !== grandTotal) return NextResponse.json({ success: false, message: `Partial payments must sum to ₹${grandTotal}. Remaining: ₹${grandTotal - totalPartial}` }, { status: 400 });

    Object.assign(existing, {
      items: parsedItems, partialPayments, deliveryPeriod, deliveredMetrics, checklist, categoryNotes, cityPages, subtotal,
      gstAmount, tdsApplicable, tdsAmount, discountType, discountInput: Number(discountInput || 0), discountAmount, grandTotal, notes, validTill, paymentMethod
    });

    existing.markModified("items");
    const updated = await existing.save();
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await ProposalNew.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
