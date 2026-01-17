import { connectDB } from "@/lib/db";
import Invoice from "@/models/admin/invoice/Invoice";
import InvoiceService from "@/models/admin/invoice/InvoiceService"; // Make sure to import this for population

export async function GET(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    // Find the invoice by its ID and populate the services
    const invoiceFromDb = await Invoice.findById(id).populate({
      path: "services",
      model: "InvoiceService",
      select: "serviceName HSN price",
    });

    if (!invoiceFromDb) {
      return Response.json(
        {
          message: "Invoice for PDF download not found",
          success: false,
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      message: "PDF data fetched successfully",
      data: invoiceFromDb,
    });
  } catch (error) {
    console.log("Error while fetching invoice for PDF", error);
    return Response.json(
      {
        success: false,
        message: "Server error while fetching PDF data",
      },
      {
        status: 500,
      }
    );
  }
}
