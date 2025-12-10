import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";


export async function GET(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    // Find the customer by ID and populate the 'proposals' field
    const customer = await Customer.findById(id).populate({
      path: "proposals",
      select:
        "clientName clientCompany clientAddress dateOfProposal GSTIN totalAmount proposalNo",
    });

    if (!customer) {
      return Response.json(
        {
          success: false,
          message: "Customer not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Customer proposals fetched successfully",
        data: customer.proposals,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return Response.json(
      {
        success: false,
        message: "server error",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
