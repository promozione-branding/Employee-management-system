import { connectDB } from "@/lib/db";
import InvoiceService from "@/models/admin/invoice/InvoiceService";

export async function POST(req) {
  try {
    await connectDB();

    const { serviceName, HSN, price } = await req.json();

    if (!serviceName || !HSN || !price) {
      return Response.json({
        message: "Please fill serviceName HSN price",
        success: false,
      });
    }

    const newInviceService = await InvoiceService.create({
      serviceName,
      HSN,
      price,
    });
    return Response.json(
      {
        success: true,
        message: "invoices services add sucessfully",
        data: newInviceService,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Creating invoice services api", error);
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
