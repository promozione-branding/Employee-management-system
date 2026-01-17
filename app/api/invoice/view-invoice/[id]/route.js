import { connectDB } from "@/lib/db";
import Invoice from "@/models/admin/invoice/Invoice";

export async function GET(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    console.log(id);

    let invoiceFromDb = await Invoice.findById(id).populate({
      path: "services",
      select: "serviceName HSN price",
    });
    if (!invoiceFromDb) {
      return Response.json(
        {
          message: "Invoice does not exits",
          success: false,
        },
        {
          status: 404,
        }
      );
    }

    // Transform the data to match the frontend's expectations
    const findInvoice = {
      ...invoiceFromDb.toObject(),
      services: invoiceFromDb.services.map((service) => ({
        id: service._id,
        description: service.serviceName,
        // Assuming quantity is always 1 and rate is the price from the DB
        quantity: 1,
        rate: service.price,
        amount: service.price, // Assuming amount is same as rate for quantity 1
      })),
    };

    return Response.json({
      success: true,
      message: "Invoice details fetched successfully",
      data: findInvoice,
    });
  } catch (error) {
    console.log("Error while editing invoice", error);
    return Response.json(
      {
        success: false,
        message: "server error hai",
      },
      {
        status: 500,
      }
    );
  }
}
