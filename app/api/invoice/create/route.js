import { connectDB } from "@/lib/db";
import Invoice from "@/models/invoice/Invoice";
import Customer from "@/models/Customer";

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    // 1. Find the customer first to ensure they exist
    const findCustomer = await Customer.findById(data.clientId);

    if (!findCustomer) {
      return Response.json(
        {
          success: false,
          message: "Customer with the provided clientId not found",
        },
        { status: 404 }
      ); 
    }

    // 2. Now, create the invoice
    const invoice = await Invoice.create(data);

    if (!invoice) {
      throw new Error("Error while creating the invoice");
    }

    findCustomer.invoices.push(invoice._id);
    await findCustomer.save();

    return Response.json(
      {
        success: true,
        message: "Invoice created successfully!",
        data: invoice,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE INVOICE API ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Invoice error",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
