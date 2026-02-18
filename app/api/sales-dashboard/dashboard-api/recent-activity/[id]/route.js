// import { connectDB } from "@/lib/db";
// import Meeting from "@/models/admin/meeting/Meeting";
// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import Customer from "@/models/admin/Customer";
// import SalesEmployee from "@/models/employee/sales/SalesEmployee";

// export async function GET(req, { params }) {
//   try {
//     await connectDB();

//     const { id } = await params;

//     const meetings = await Meeting.aggregate([
//       // break meetingUpdate array into documents
//       { $unwind: "$meetingUpdate" },

//       // filter by salesperson
//       {
//         $match: {
//           "meetingUpdate.salesPersonId": new mongoose.Types.ObjectId(id),
//         },
//       },

//       // latest first
//       {
//         $sort: {
//           "meetingUpdate.createdAt": -1,
//         },
//       },

//       // only last 5
//       { $limit: 5 },

//       // get customer name only
//       {
//         $lookup: {
//           from: "customers", // mongodb collection name
//           localField: "meetingUpdate.clientId",
//           foreignField: "_id",
//           as: "client",
//         },
//       },

//       {
//         $unwind: {
//           path: "$client",
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       // clean response
//       {
//         $project: {
//           _id: "$meetingUpdate._id",
//           updateType: "$meetingUpdate.updateType",
//           status: "$meetingUpdate.status",
//           note: "$meetingUpdate.note",
//           meetingAt: "$meetingUpdate.meetingAt",
//           reminderAt: "$meetingUpdate.reminderAt",
//           createdAt: "$meetingUpdate.createdAt",
//           clientName: "$client.name",
//         },
//       },
//     ]);

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Last 5 meeting updates",
//         data: meetings,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { success: false, message: "Server error" },
//       { status: 500 },
//     );
//   }
// }

// export async function GET(req, { params }) {
//   try {
//     await connectDB();

//     const { id } = await params;

//     const meetings = await SalesEmployee.find({ employeeId: id });

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Last 5 meeting updates",
//         data: meetings,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { success: false, message: "Server error" },
//       { status: 500 },
//     );
//   }
// }

// another

// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Customer from "@/models/admin/Customer";
// import Proposal from "@/models/admin/Proposal";
// import SaleWork from "@/models/employee/sales/SalesWork";

// export async function GET(req, { params }) {
//   try {
//     await connectDB();

//     const { id } = await params;

//     /* -------------------- CUSTOMER ACTIVITY -------------------- */
//     const customers = await Customer.find({
//       salesExecutive: id,
//     })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .select("_id name createdAt company");

//     const customerActivity = customers.map((c) => ({
//       type: "customer",
//       action: "created",
//       title: `Customer created`,
//       refId: c._id,
//       createdAt: c.createdAt,
//     }));

//     /* -------------------- PROPOSAL ACTIVITY -------------------- */
//     const proposals = await Proposal.find({
//       salesExecutive: id,
//     })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .select("_id createdAt");

//     const proposalActivity = proposals.map((p) => ({
//       type: "proposal",
//       action: "created",
//       title: `Proposal created`,
//       refId: p._id,
//       createdAt: p.createdAt,
//     }));

//     /* -------------------- SALE WORK ACTIVITY -------------------- */
//     const saleWorks = await SaleWork.find({
//       salesExecutive: id,
//     })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .select("_id createdAt");

//     const saleWorkActivity = saleWorks.map((s) => ({
//       type: "saleWork",
//       action: "updated",
//       title: `Sale work updated`,
//       refId: s._id,
//       createdAt: s.createdAt,
//     }));

//     /* -------------------- MEETING ACTIVITY -------------------- */

//     /* -------------------- MERGE ALL -------------------- */

//     const activities = [
//       ...customerActivity,
//       // ...proposalActivity,
//       // ...saleWorkActivity,
//     ];

//     /* 🔥 Sort latest first */
//     activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     /* optional: show only last 10 */
//     const recentActivities = activities.slice(0, 10);

//     return NextResponse.json({
//       success: true,
//       data: recentActivities,
//     });
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json(
//       { success: false, message: "Server error" },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import Proposal from "@/models/admin/Proposal";
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

    const activities = [
      ...customerActivity,
      ...proposalActivity,
    ];

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
