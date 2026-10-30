// app/api/calling/initiate/route.js

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { initiateOutboundCall, normalizePhone } from "@/lib/myoperator";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import CallLog from "@/models/employee/sales/CallLog";
import Customer from "@/models/admin/Customer";
import Employee from "@/models/employee/Employee";

export async function POST(req) {
  try {
    await connectDB();

    // --- auth ---
    const user = await getAuthUser(req);
    if (!user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // --- parse ---
    // accept optional "phone" override
    const { customerId, phone } = await req.json();
    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "customerId required" },
        { status: 400 },
      );
    }

    // --- load ---
    const [customer, agent] = await Promise.all([
      Customer.findById(customerId).lean(),
      Employee.findOne({ user: user._id }).lean(),
    ]);

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }
    if (!agent) {
      return NextResponse.json(
        { success: false, message: "Employee record not found for this user" },
        { status: 404 },
      );
    }

    // --- myoperator user mapping ---
    const myopUserId = agent?.basicDetails?.myoperatorUserId;
    if (!myopUserId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your MyOperator user id is not mapped. Ask admin to add it in the Employee profile.",
        },
        { status: 400 },
      );
    }

    // --- phone selection: primary, existing alternate, or auto-save valid new ---
    const normalizeCmp = (n) => String(n || "").replace(/\D/g, "").slice(-10);
    const requested = phone ? normalizeCmp(phone) : "";
    let dialNumber = customer.phone;

    if (requested) {
      const primaryDigits = normalizeCmp(customer.phone);
      const alternates = (customer.alternatePhones || []).map(normalizeCmp);

      if (requested === primaryDigits) {
        dialNumber = customer.phone;
      } else if (alternates.includes(requested)) {
        const match = customer.alternatePhones.find(
          (p) => normalizeCmp(p) === requested,
        );
        dialNumber = match;
      } else if (/^[6-9]\d{9}$/.test(requested)) {
        // AUTO-SAVE fallback — valid Indian number not yet in list.
        // Handles race where POST /phones hasn't propagated yet.
        try {
          await Customer.updateOne(
            { _id: customer._id },
            { $addToSet: { alternatePhones: requested } },
          );
          console.log("[initiate] auto-saved alternate:", requested);
        } catch (e) {
          console.error("[initiate] auto-save failed:", e);
        }
        dialNumber = requested;
      } else {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid phone number. Must be a 10-digit Indian mobile starting with 6-9.",
          },
          { status: 400 },
        );
      }
    }

    // --- build call log ---
    const referenceId = `call_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const customerPhone = normalizePhone(dialNumber);
    const agentName = agent?.basicDetails?.name || "";
    const agentEmail = agent?.basicDetails?.email || "";

    const log = await CallLog.create({
      referenceId,
      companyId: process.env.MYOP_COMPANY_ID,
      direction: "outbound",
      fromNumber: normalizePhone(process.env.MYOP_VIRTUAL_NUMBER),
      toNumber: customerPhone,
      virtualNumber: process.env.MYOP_VIRTUAL_NUMBER,
      status: "initiated",
      connected: false,
      startedAt: new Date(),
      agentErpUserId: agent._id,
      agentName,
      agentEmail,
      agentMyopUserId: myopUserId,
      customerId: customer._id,
      customerName: customer.name || "",
      customerPhone,
    });

    // --- fire OBD ---
    try {
      const result = await initiateOutboundCall({
        number: customerPhone,
        userId: myopUserId,
        referenceId,
      });

      if (result?.unique_id) {
        log.myoperatorCallId = result.unique_id;
        await log.save();
      }

      return NextResponse.json({
        success: true,
        message: "Call initiated",
        data: {
          callLogId: log._id,
          referenceId,
          myoperator: result,
        },
      });
    } catch (obdErr) {
      log.status = "failed";
      log.lastEventType = "obd_error";
      log.lastEventAt = new Date();
      log.rawWebhookPayloads.push({
        stage: "obd_error",
        error: obdErr.message,
        raw: obdErr.raw,
      });
      await log.save();

      return NextResponse.json(
        {
          success: false,
          message: obdErr.message,
          data: { callLogId: log._id },
        },
        { status: obdErr.status || 500 },
      );
    }
  } catch (err) {
    console.error("[/api/calling/initiate]", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}
