import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import Proposal from "@/models/admin/proposal/Proposal";
import SaleWork from "@/models/employee/sales/SalesWork";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    /* -------------------- CUSTOMER ACTIVITY -------------------- */
    const customers = await Customer.find({
      salesExecutive: id,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id name company createdAt");

    const customerActivity = customers.map((c) => ({
      type: "customer",
      action: "created",
      title: `Customer ${c.name} (${c.company}) created`,
      refId: c._id,
      createdAt: c.createdAt,
    }));

    /* -------------------- PROPOSAL ACTIVITY -------------------- */
    const proposals = await Proposal.find({
      salesExecutive: id,
    })
      .populate({
        path: "clientId", // must match schema field
        select: "name company",
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id proposalNo clientId createdAt");

    const proposalActivity = proposals.map((p) => ({
      type: "proposal",
      action: "created",
      title: `Proposal ${p.proposalNo} created for ${
        p.clientId?.company || "Customer"
      }`,
      refId: p._id,
      createdAt: p.createdAt,
    }));

    /* -------------------- SALE WORK ACTIVITY -------------------- */
    const saleWorks = await SaleWork.find({
      employeeId: id,
    })
      .populate({
        path: "clientId",
        select: "name company",
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id clientId createdAt");

    const saleWorkActivity = saleWorks.map((s) => ({
      type: "saleWork",
      action: "updated",
      title: `Sale work updated for ${s.clientId?.company || "Customer"}`,
      refId: s._id,
      createdAt: s.createdAt,
    }));

    /* -------------------- MERGE -------------------- */

    const activities = [...customerActivity, ...proposalActivity];

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({
      success: true,
      data: activities.slice(0, 10),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
