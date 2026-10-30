// app/api/customer/[id]/phones/route.js
// Add / list / remove alternate phone numbers for a customer.
// No new model — stored in Customer.alternatePhones [String].

import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Customer from "@/models/admin/Customer";
import { getAuthUser } from "@/lib/getAuthUser";

// ── Helpers ──
const sanitize = (n) => String(n || "").replace(/\D/g, "");
const normalize = (n) => {
  let d = sanitize(n);
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
};
const isValidIndian = (d) => /^[6-9]\d{9}$/.test(d);

// ────────────────────────────────────────────────────────────
// GET — list alternate phones for the customer
// ────────────────────────────────────────────────────────────
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!id)
      return NextResponse.json(
        { success: false, message: "customer id required" },
        { status: 400 },
      );

    const customer = await Customer.findById(id)
      .select("phone alternatePhones name")
      .lean();

    if (!customer)
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );

    return NextResponse.json(
      {
        success: true,
        data: {
          name: customer.name || "",
          primary: customer.phone ? String(customer.phone) : "",
          alternates: customer.alternatePhones || [],
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[phones-GET]", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

// ────────────────────────────────────────────────────────────
// POST — add an alternate phone
// Body: { phone }
// ────────────────────────────────────────────────────────────
export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!id)
      return NextResponse.json(
        { success: false, message: "customer id required" },
        { status: 400 },
      );

    const body = await req.json();
    const normalized = normalize(body?.phone);

    if (!isValidIndian(normalized))
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number (10-digit Indian mobile required)",
        },
        { status: 400 },
      );

    const customer = await Customer.findById(id).select(
      "phone alternatePhones",
    );
    if (!customer)
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );

    // Avoid duplicating primary or existing alternates
    const primaryDigits = normalize(customer.phone);
    const existing = (customer.alternatePhones || []).map(normalize);

    if (normalized === primaryDigits)
      return NextResponse.json(
        { success: false, message: "This is already the primary number" },
        { status: 400 },
      );

    if (existing.includes(normalized))
      return NextResponse.json(
        { success: false, message: "This number is already added" },
        { status: 400 },
      );

    if ((customer.alternatePhones || []).length >= 5)
      return NextResponse.json(
        { success: false, message: "Maximum 5 alternate numbers allowed" },
        { status: 400 },
      );

    // Force-persist with $addToSet (bypasses any Mongoose strict stripping)
    await Customer.updateOne(
      { _id: id },
      { $addToSet: { alternatePhones: normalized } },
    );

    // VERIFY read-back from DB
    const verified = await Customer.findById(id)
      .select("alternatePhones")
      .lean();
    const savedList = verified?.alternatePhones || [];

    if (!savedList.map(normalize).includes(normalized)) {
      console.error("[phones-POST] ❌ SAVE FAILED", {
        normalized,
        customerId: id,
        savedList,
        hint:
          "Is 'alternatePhones' in models/admin/Customer.js? Server may need restart after schema change.",
      });
      return NextResponse.json(
        {
          success: false,
          message:
            "Server error: phone could not be saved. 'alternatePhones' field missing from Customer schema — add it and restart the server.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Phone added",
        data: { alternates: savedList },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[phones-POST]", err);
    return NextResponse.json(
      { success: false, message: "Server error: " + err.message },
      { status: 500 },
    );
  }
}

// ────────────────────────────────────────────────────────────
// DELETE — remove an alternate phone
// Query: ?phone=9876543210
// ────────────────────────────────────────────────────────────
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!id)
      return NextResponse.json(
        { success: false, message: "customer id required" },
        { status: 400 },
      );

    const { searchParams } = new URL(req.url);
    const target = normalize(searchParams.get("phone"));
    if (!target)
      return NextResponse.json(
        { success: false, message: "phone required" },
        { status: 400 },
      );

    // Force-pull from array
    await Customer.updateOne(
      { _id: id },
      { $pull: { alternatePhones: target } },
    );

    // Read back
    const verified = await Customer.findById(id)
      .select("alternatePhones")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Phone removed",
        data: { alternates: verified?.alternatePhones || [] },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[phones-DELETE]", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
