import { connectDB } from "@/lib/db";
import InvoiceService from "@/models/admin/invoice/InvoiceService";

export async function GET(req) {
  try {
    await connectDB();

    const allInvoiceServices = await InvoiceService.find({}).sort({
      createdAt: -1,
    });

    return Response.json(
      {
        success: true,
        message: "Successfully retrieved all invoice services.",
        data: allInvoiceServices,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while fetching invoice services.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
