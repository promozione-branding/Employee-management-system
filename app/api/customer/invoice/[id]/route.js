import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import Invoice from "@/models/admin/invoice/Invoice";

export async function GET(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    const customer = await Customer.findById(id).populate({
      path: "invoices",
      select:
        "clientName clientCompany clientAddress GSTIN services taxType invoiceDate invoiceNo totalAmount",
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

    return Response.json({
      success: true,
      message: "Customer Invoice fetched successfully",
      data: customer?.invoices,
    });
  } catch (error) {
    console.log(error);
    return Response.json(
      {
        success: false,
        message: "server error while finding the invoice of customer",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
