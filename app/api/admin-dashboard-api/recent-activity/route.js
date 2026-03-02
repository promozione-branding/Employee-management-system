import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import Proposal from "@/models/admin/proposal/Proposal";
import EmployeeWorkDetail from "@/models/employee/EmployeeWorkDetail";
import SalesWork from "@/models/employee/sales/SalesWork";
import { NextResponse } from "next/server";
import Employee from "@/models/employee/Employee";

export async function GET(req) {
  try {
    await connectDB();

    /* -------------------- CUSTOMER ACTIVITY -------------------- */
    const customers = await Customer.find()
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

    /* -------------------- Employee ACTIVITY -------------------- */
    const employeeWork = await EmployeeWorkDetail.find()
      .sort({ createdAt: -1 })
      .populate({
        path: ["employeeId", "clientId"],
        select: ["basicDetails.name", "name"],
      })
      .limit(5);

    const employeeActivity = employeeWork.map((c) => {
      const employeeNames = c.employeeId
        ?.map((e) => e.basicDetails.name)
        .join(", ");
      return {
        type: "employee",
        action: "worked",
        title: `${employeeNames || "An employee"} worked on a ${c.department} task for ${c.clientId?.name || "a customer"}`,
        refId: c._id,
        createdAt: c.createdAt,
      };
    });

    /* -------------------- PROPOSAL ACTIVITY -------------------- */
    const proposals = await Proposal.find({})
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
    const saleWorks = await SalesWork.find({})
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

    const activities = [
      ...customerActivity,
      ...proposalActivity,
      ...saleWorkActivity,
      ...employeeActivity,
    ];

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json(
      {
        data: activities,
        success: true,
        message: "Success",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
