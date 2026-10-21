import { connectDB } from "@/lib/db";
import LedgerNew from "@/models/admin/proposalNew/LedgerNew";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) return NextResponse.json({ success: false }, { status: 400 });

    const entries = await LedgerNew.find({ customerId }).sort({ date: 1, createdAt: 1 });

    let runningBalance = 0;
    const calculatedEntries = entries.map((entry) => {
      runningBalance += (entry.debit || 0) - (entry.credit || 0);
      return { ...entry.toObject(), balance: runningBalance };
    });

    return NextResponse.json({ success: true, data: calculatedEntries }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    
    const entry = await LedgerNew.create({
      customerId: body.customerId,
      proposalId: body.proposalId || null,
      date: body.date,
      particulars: body.particulars,
      voucher: body.voucher,
      debit: Number(body.debit) || 0,
      credit: Number(body.credit) || 0,
      extraAmount: Number(body.extraAmount) || 0,
      transactionId: body.transactionId,
      isConfidential: Boolean(body.isConfidential)
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    
    const updated = await LedgerNew.findByIdAndUpdate(
      body.entryId,
      {
        date: body.date,
        particulars: body.particulars,
        voucher: body.voucher,
        debit: Number(body.debit) || 0,
        credit: Number(body.credit) || 0,
        extraAmount: Number(body.extraAmount) || 0,
        transactionId: body.transactionId,
      },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    await LedgerNew.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
