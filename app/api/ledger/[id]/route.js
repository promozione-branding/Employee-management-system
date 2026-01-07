import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Ledger from "@/models/Ledger";
import Proposal from "@/models/Proposal";

export async function GET(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    const findLedger = await Ledger.findById(id).populate({
      path: "proposalIds",
    });

    if (!findLedger) {
      return NextResponse.json(
        {
          message: "Ledger does not exists",
          success: false,
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ledger details fetched successfully",
        data: findLedger,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;
    const { entriesData, proposalId } = await req.json();

    const updatedLedger = await Ledger.findByIdAndUpdate(
      id,
      {
        $push: { entries: entriesData, proposalIds: proposalId },
      },
      { new: true }
    );

    if (!updatedLedger) {
      return NextResponse.json(
        {
          success: false,
          message: "Ledger not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Entry added successfully",
      data: updatedLedger,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      message: "Server error while adding entry",
    });
  }
}
