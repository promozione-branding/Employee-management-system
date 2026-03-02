import { connectDB } from "@/lib/db";
import Proposal from "@/models/admin/proposal/Proposal";
import Service from "@/models/admin/proposal/Service";

export async function GET(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const proposal = await Proposal.findById(id).populate({
      path: "services",
      model: "Service",
      select:
        "serviceTitle amount duration description discountAmount discountPercentage",
    });

    if (!proposal) {
      return Response.json(
        {
          success: false,
          message: "Server error while fetching proposal Pdf data",
        },
        { status: 500 },
      );
    }

    return Response.json({
      success: true,
      message: "Proposal data fetched successfully",
      data: proposal,
    });
  } catch (error) {
    console.log("Error while fetching data for Proposal pdf", error);
    return Response.json(
      {
        success: false,
        message: "Server error while fetching proposal Pdf data",
      },
      { status: 500 },
    );
  }
}
