
import { connectDB } from "@/lib/db";
import Invoice from "@/models/admin/invoice/Invoice";

export async function GET(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    // Find invoice by ID
    const invoiceFromDb = await Invoice.findById(id);

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

    // Convert Mongoose document to a plain object
    const invoiceData = invoiceFromDb.toObject();

    // Backward compatibility for existing invoices
    // without an invoiceType field
    invoiceData.invoiceType =
      invoiceData.invoiceType || "normal";

    return Response.json({
      success: true,
      message: "PDF data fetched successfully",
      data: invoiceData,
    });
  } catch (error) {
    console.error(
      "Error while fetching invoice for PDF",
      error
    );

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
