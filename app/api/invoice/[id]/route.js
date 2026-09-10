import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/getAuthUser";
import Customer from "@/models/admin/Customer";
import Invoice from "@/models/admin/invoice/Invoice";
import InvoiceService from "@/models/admin/invoice/InvoiceService";
import { createAuditLog } from "@/utils/createAuditLog";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    // -----------------------------------------
    // AUTH
    // -----------------------------------------

    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // -----------------------------------------
    // FIND INVOICE
    // -----------------------------------------

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          message: "Invoice does not exist",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // FIND CUSTOMER
    // -----------------------------------------

    const customer = await Customer.findById(
      invoice.clientId
    );

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer linked to this invoice was not found",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // OLD DATA FOR AUDIT
    // -----------------------------------------

    const oldData = invoice.toObject();

    // -----------------------------------------
    // CHECK INVOICE NUMBER
    // -----------------------------------------

    if (
      body.invoiceNo &&
      body.invoiceNo !== invoice.invoiceNo
    ) {
      const existingInvoice =
        await Invoice.findOne({
          invoiceNo: body.invoiceNo,
          _id: { $ne: invoice._id },
        });

      if (existingInvoice) {
        return NextResponse.json(
          {
            success: false,
            message: `Invoice number ${body.invoiceNo} already exists.`,
          },
          { status: 409 }
        );
      }
    }

    // -----------------------------------------
    // SERVICES
    // -----------------------------------------

    let serviceSnapshot = invoice.services;
    let totalAmount = Number(
      invoice.totalAmount || 0
    );

    if (Array.isArray(body.services)) {
      if (body.services.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please select at least one service.",
          },
          { status: 400 }
        );
      }

      // Remove empty and duplicate IDs
      const serviceIds = [
        ...new Set(
          body.services
            .filter(Boolean)
            .map((serviceId) =>
              String(serviceId)
            )
        ),
      ];

      if (serviceIds.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please select at least one service.",
          },
          { status: 400 }
        );
      }

      // -----------------------------------------
      // FIND ACTUAL INVOICE SERVICES
      // -----------------------------------------

      const services =
        await InvoiceService.find({
          _id: {
            $in: serviceIds,
          },
        });

      // -----------------------------------------
      // CHECK ALL SERVICES EXIST
      // -----------------------------------------

      if (
        services.length !==
        serviceIds.length
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "One or more selected services were not found.",
          },
          { status: 404 }
        );
      }

      // -----------------------------------------
      // CREATE SNAPSHOT
      // -----------------------------------------

      serviceSnapshot = services.map(
        (service) => ({
          serviceName:
            service.serviceName,

          HSN: service.HSN,

          price: Number(
            service.price || 0
          ),
        })
      );

      // -----------------------------------------
      // CALCULATE TOTAL
      // -----------------------------------------

      const serviceTotal =
        serviceSnapshot.reduce(
          (total, service) =>
            total +
            Number(service.price || 0),
          0
        );

      // 18% GST
      const taxAmount =
        serviceTotal * 0.18;

      totalAmount =
        serviceTotal + taxAmount;
    }

    // -----------------------------------------
    // UPDATE INVOICE
    // -----------------------------------------

    invoice.clientName =
      body.clientName ??
      invoice.clientName;

    invoice.clientCompany =
      body.clientCompany ??
      invoice.clientCompany;

    invoice.clientAddress =
      body.clientAddress ??
      invoice.clientAddress;

    invoice.GSTIN =
      body.GSTIN ?? invoice.GSTIN;

    invoice.tanNo =
      body.tanNo ?? invoice.tanNo;

    invoice.taxType =
      body.taxType ?? invoice.taxType;

    invoice.invoiceDate =
      body.invoiceDate ??
      invoice.invoiceDate;

    invoice.invoiceNo =
      body.invoiceNo ??
      invoice.invoiceNo;

    invoice.services =
      serviceSnapshot;

    invoice.totalAmount =
      totalAmount;

    // -----------------------------------------
    // SAVE
    // -----------------------------------------

    const editedInvoice =
      await invoice.save();

    // -----------------------------------------
    // AUDIT LOG
    // -----------------------------------------

    const { _id: auditId } =
      await createAuditLog({
        clientId:
          editedInvoice.clientId,

        entityType: "Invoice",

        entityId:
          editedInvoice._id,

        action: "UPDATE",

        oldData,

        newData:
          editedInvoice.toObject(),

        userId: authUser._id,
      });

    // -----------------------------------------
    // CUSTOMER HISTORY
    // -----------------------------------------

    customer.history.push(auditId);

    await customer.save();

    // -----------------------------------------
    // RESPONSE
    // -----------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Invoice updated successfully",
        data: editedInvoice,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "UPDATE INVOICE API ERROR:",
      error
    );

    if (
      error.code === 11000 &&
      error.keyPattern?.invoiceNo
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invoice number already exists.",
        },
        { status: 409 }
      );
    }

    if (
      error.name === "CastError"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid invoice ID.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    let findInvoice = await Invoice.findById(id);
    if (!findInvoice) {
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
        message: "server error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invoice ID is required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // FIND INVOICE
    // -----------------------------------------

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          message: "Invoice not found.",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // DELETE INVOICE
    // -----------------------------------------

    await Invoice.findByIdAndDelete(id);

    // -----------------------------------------
    // REMOVE INVOICE FROM CUSTOMER
    // -----------------------------------------

    if (invoice.clientId) {
      await Customer.findByIdAndUpdate(
        invoice.clientId,
        {
          $pull: {
            invoices: invoice._id,
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Invoice deleted successfully.",
        data: {
          invoiceId: invoice._id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE INVOICE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to delete invoice.",
      },
      { status: 500 }
    );
  }
}