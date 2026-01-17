import { connectDB } from "@/lib/db";
import Invoice from "@/models/admin/invoice/Invoice";

export async function GET(req) {
  try {
    await connectDB();

    const invoices = await Invoice.find();
    return Response.json(
      {
        success: true,
        message: "All Invoices",
        data: invoices,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("GET ALL INVOICE API ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Get All Invoice error",
        error: error?.message,
      },
      {
        status: 500,
      }
    );
  }
}
