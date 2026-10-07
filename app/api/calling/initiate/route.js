// app/api/calling/initiate/route.js

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { initiateOutboundCall, normalizePhone } from "@/lib/myoperator";

import dbConnect from "@/lib/dbConnect";                 // 🔧 ADAPT ME
import { getServerSession } from "next-auth";            // 🔧 ADAPT ME (or your auth)
import CallLog from "@/models/employee/sales/CallLog";
import Customer from "@/models/admin/Customer";
import Employee from "@/models/employee/Employee";

export async function POST(req) {
  try {
    await dbConnect();

    // --- auth ---
    const session = await getServerSession(); // 🔧 ADAPT ME
    const erpUserId =
      session?.user?._id || session?.user?.id || req.headers.get("x-user-id");
    if (!erpUserId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // --- parse ---
    const { customerId } = await req.json();
    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "customerId required" },
        { status: 400 },
      );
    }

    // --- load ---
    const [customer, agent] = await Promise.all([
      Customer.findById(customerId).lean(),
      Employee.findById(erpUserId).lean(),
    ]);

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }
    if (!agent) {
      return NextResponse.json(
        { success: false, message: "Agent (Employee) not found" },
        { status: 404 },
      );
    }

    // --- myoperator user mapping ---
    const myopUserId = agent.myoperatorUserId;
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

    // --- build call log ---
    const referenceId = `call_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const customerPhone = normalizePhone(customer.phone);
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