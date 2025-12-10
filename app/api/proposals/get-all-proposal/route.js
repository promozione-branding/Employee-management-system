import { connectDB } from "@/lib/db";
import Proposal from "@/models/Proposal"; // Your mongoose model

export async function GET() {
  try {
    await connectDB();

    const items = await Proposal.find()
      .select("clientName clientCompany dateOfProposal GSTIN totalAmount proposalNo")
      .sort({ createdAt: -1 });

    return Response.json(
      {
        success: true,
        data: items,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("GET API Error:", error);
    return Response.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
