// app/api/workflow/create/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Workflow from "@/models/admin/Workflow";
import Customer from "@/models/admin/Customer";
import User from "@/models/admin/User";
import { getAuthUser } from "@/lib/getAuthUser";
import {
  sendWorkflowStartedInternalMail,
  sendWorkflowStartedClientMail,
} from "@/lib/mail/workflowMailer";

export async function POST(req) {
  try {
    await connectDB();

    // ── Admin-only guard ──
    const authUser = await getAuthUser(req);
    if (!authUser?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const me = await User.findById(authUser._id).select("role username email").lean();
    if (!me || me.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admins only" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      customerId,
      proposalId,
      proposalNumber,
      category,
      categoryLabel,
      description,
      startDate,
      endDate,
      duration,
    } = body;

    // ── Validation ──
    if (!customerId || !proposalId || !category || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    if (new Date(endDate) < new Date(startDate)) {
      return NextResponse.json(
        { success: false, message: "End date cannot be before start date" },
        { status: 400 }
      );
    }

    const customer = await Customer.findById(customerId)
      .select("name company email")
      .lean();
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    const workflow = await Workflow.create({
      customerId,
      proposalId,
      proposalNumber: proposalNumber || "",
      category,
      categoryLabel: categoryLabel || category,
      description: description || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      duration: duration || "custom",
      clientName: customer.name || "",
      clientCompany: customer.company || "",
      clientEmail: customer.email || "",
      createdByAdminId: me._id,
      createdByAdminName: me.username || "",
      createdByAdminEmail: me.email || "",
      status: "active",
    });

    // ── Fire mails (non-blocking, never breaks response) ──
    try {
      await Promise.allSettled([
        sendWorkflowStartedInternalMail({ workflow }),
        sendWorkflowStartedClientMail({ workflow }),
      ]);
    } catch (mailErr) {
      console.error("[workflow-create] mail hook error:", mailErr);
    }

    return NextResponse.json(
      { success: true, message: "Workflow created", data: workflow },
      { status: 201 }
    );
  } catch (error) {
    console.error("[workflow-create]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
