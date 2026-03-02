import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Proposal from "@/models/admin/proposal/Proposal";
import { validateCreateProposal } from "@/lib/validation/sales/proposal";
import SalesEmployee from "@/models/employee/sales/SalesEmployee";
import Customer from "@/models/admin/Customer";

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

    // Create proposal
    const proposal = await Proposal.create(value);

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
