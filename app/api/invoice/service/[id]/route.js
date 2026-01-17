import { connectDB } from "@/lib/db";
import InvoiceService from "@/models/admin/invoice/InvoiceService";

export async function GET(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    const invoice = await InvoiceService.findById(id).select(
      "serviceName HSN price"
    );

    if (!invoice) {
      return Response.json(
        {
          success: false,
          message: "invoice not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        data: invoice,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Get invoice service by id Error", error);
    return Response.json(
      { success: false, message: "Server error" },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    const invoice = await InvoiceService.findByIdAndDelete(id);

    if (!invoice) {
      return Response.json(
        {
          success: false,
          message: "invoice not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        data: invoice,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Delete invoice service by id Error", error);
    return Response.json(
      { success: false, message: "Server error" },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    const { serviceName, HSN, price } = await req.json();

    const updatedService = await InvoiceService.findByIdAndUpdate(
      id,
      { serviceName, HSN, price },
      { new: true }
    );

    if (!updatedService) {
      return Response.json(
        {
          success: false,
          message: "invoice not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "invoice updated successfully",
        data: updatedService,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("editing invoice service by id Error", error);
    return Response.json(
      { success: false, message: "Server error" },
      {
        status: 500,
      }
    );
  }
}
