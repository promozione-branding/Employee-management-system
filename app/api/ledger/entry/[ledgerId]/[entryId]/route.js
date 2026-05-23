import { connectDB } from "@/lib/db";
import Ledger from "@/models/admin/Ledger";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { ledgerId, entryId } = await params;

    if (!ledgerId || !entryId) {
      return NextResponse.json(
        { success: false, message: "ledgerId and entryId required" },
        { status: 400 },
      );
    }

    // 🔍 Find Ledger
    const ledger = await Ledger.findById(ledgerId);
    if (!ledger) {
      return NextResponse.json(
        { success: false, message: "Ledger not found" },
        { status: 404 },
      );
    }

    // 🔎 Find entry index
    const entryIndex = ledger.entries.findIndex(
      (e) => e._id.toString() === entryId,
    );

    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Entry not found" },
        { status: 404 },
      );
    }

    // 🧾 Remove entry
    ledger.entries.splice(entryIndex, 1);

    // 🔄 Recalculate balances
    // let runningBalance = ledger.openingBalance;

    // ledger.entries = ledger.entries
    //   .sort((a, b) => new Date(a.date) - new Date(b.date)) // ensure order
    //   .map((entry) => {
    //     runningBalance += entry.debit - entry.credit;
    //     entry.balance = runningBalance;
    //     return entry;
    //   });

    await ledger.save();

    return NextResponse.json(
      {
        success: true,
        message: "Ledger entry deleted successfully",
        data: ledger,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE Ledger Entry Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { ledgerId, entryId } = await params;
    const body = await req.json();

    if (!ledgerId || !entryId) {
      return NextResponse.json(
        { success: false, message: "ledgerId and entryId required" },
        { status: 400 },
      );
    }

    // 🔍 Find ledger
    const ledger = await Ledger.findById(ledgerId);
    if (!ledger) {
      return NextResponse.json(
        { success: false, message: "Ledger not found" },
        { status: 404 },
      );
    }

    // 🔎 Find entry
    const entryIndex = ledger.entries.findIndex(
      (e) => e._id.toString() === entryId,
    );

    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Entry not found" },
        { status: 404 },
      );
    }

    // 🧠 Update only allowed fields
    const entry = ledger.entries[entryIndex];

    entry.date = body.date || entry.date;
    entry.voucher = body.voucher || entry.voucher;
    entry.debit = body.debit ?? entry.debit;
    entry.credit = body.credit ?? entry.credit;
    entry.particular = body.particular || entry.particular;

    // Optional payment modes
    entry.chequeDetails = body.chequeDetails || entry.chequeDetails;
    entry.net_banking = body.net_banking || entry.net_banking;
    entry.upi = body.upi || entry.upi;
    entry.credit_debit_card = body.credit_debit_card || entry.credit_debit_card;

    // 🔄 Recalculate ALL balances
    let runningBalance = ledger.openingBalance;

    ledger.entries = ledger.entries
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((e) => {
        runningBalance += e.debit - e.credit;
        e.balance = runningBalance;
        return e;
      });

    await ledger.save();

    return NextResponse.json(
      {
        success: true,
        message: "Ledger entry updated successfully",
        data: ledger,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("EDIT Ledger Entry Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
