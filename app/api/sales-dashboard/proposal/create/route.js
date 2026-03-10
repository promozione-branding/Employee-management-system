import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Proposal from "@/models/admin/proposal/Proposal";
import { validateCreateProposal } from "@/lib/validation/sales/proposal";
import SalesEmployee from "@/models/employee/sales/SalesEmployee";
import Customer from "@/models/admin/Customer";
import Service from "@/models/admin/proposal/Service";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    // Joi validation
    const { error, value } = validateCreateProposal(body);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.details.map((err) => err.message),
        },
        { status: 400 },
      );
    }

    // 🟢 SNAPSHOT SERVICES (MAIN FIX)
    let proposalServices = [];

    if (value.services && value.services.length > 0) {
      const serviceDocs = await Service.find({
        _id: { $in: value.services },
      });

      proposalServices = serviceDocs.map((s) => ({
        serviceId: s._id,
        serviceTitle: s.serviceTitle,
        amount: s.amount,
        duration: s.duration,
        description: s.description,
        discountAmount: s.discountAmount || 0,
        discountPercentage: s.discountPercentage || 0,
        finalAmount:
          s.amount -
          (s.discountAmount || 0) -
          ((s.discountPercentage || 0) / 100) * s.amount,
      }));
    }

    console.log({
      ...value,
      services: proposalServices,
    });

    // Create proposal
    const proposal = await Proposal.create({
      ...value,
      services: proposalServices,
    });

    await Customer.findByIdAndUpdate(proposal.clientId, {
      $push: { proposals: proposal._id },
    });

    // Link proposal to sales employee (if provided)
    if (proposal.salesExecutive) {
      await SalesEmployee.findOneAndUpdate(
        { employeeId: proposal.salesExecutive },
        {
          $addToSet: { proposals: proposal._id },
          $setOnInsert: { employeeId: proposal.salesExecutive },
        },
        { upsert: true, new: true },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Proposal created successfully",
        data: proposal,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create Proposal Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
