import { connectDB } from "@/lib/db";
import Invoice from "@/models/admin/invoice/Invoice";
import InvoiceService from "@/models/admin/invoice/InvoiceService";
import Customer from "@/models/admin/Customer";
import { createAuditLog } from "@/utils/createAuditLog";
import { getAuthUser } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

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

    const data = await req.json();

    // 1. FIND CUSTOMER
    const findCustomer = await Customer.findById(data.clientId);

    if (!findCustomer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer with the provided clientId not found",
        },
        { status: 404 }
      );
    }

    // 2. VALIDATE TAX TYPE
    if (!["IGST", "SGST/CGST"].includes(data.taxType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid tax type.",
        },
        { status: 400 }
      );
    }

    // 3. VALIDATE SERVICES
    if (!Array.isArray(data.services) || data.services.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select at least one service.",
        },
        { status: 400 }
      );
    }

    // Remove duplicate service IDs
    const serviceIds = [
      ...new Set(
        data.services
          .filter(Boolean)
          .map((serviceId) => String(serviceId))
      ),
    ];

    // 4. CHECK DUPLICATE INVOICE NUMBER
    if (data.invoiceNo) {
      const existingInvoice = await Invoice.findOne({
        invoiceNo: data.invoiceNo,
      });

      if (existingInvoice) {
        return NextResponse.json(
          {
            success: false,
            message: `Invoice number ${data.invoiceNo} already exists.`,
          },
          { status: 409 }
        );
      }
    }

    // 5. FETCH SERVICES
    const services = await InvoiceService.find({
      _id: { $in: serviceIds },
    });

    // Make sure every selected service exists
    if (services.length !== serviceIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more selected services were not found.",
        },
        { status: 404 }
      );
    }

    // 6. CREATE SERVICE SNAPSHOT
    const serviceSnapshot = services.map((service) => ({
      serviceName: service.serviceName,
      HSN: service.HSN,
      price: Number(service.price || 0),
    }));

    // 7. CALCULATE TAXABLE AMOUNT
    const taxableAmount = serviceSnapshot.reduce(
      (total, service) => total + Number(service.price || 0),
      0
    );

    // 8. CALCULATE TAX
    let taxAmount = 0;

    if (data.taxType === "IGST") {
      // IGST = 18%
      taxAmount = taxableAmount * 0.18;
    } else if (data.taxType === "SGST/CGST") {
      // CGST = 9%
      // SGST = 9%
      // Total = 18%
      const cgst = taxableAmount * 0.09;
      const sgst = taxableAmount * 0.09;

      taxAmount = cgst + sgst;
    }

    // 9. FINAL TAX-INCLUSIVE TOTAL
    const totalAmount = taxableAmount + taxAmount;

    // 10. CREATE INVOICE
    const invoice = await Invoice.create({
      ...data,
      services: serviceSnapshot,
      totalAmount,
    });

    // 11. CREATE AUDIT HISTORY
    const { _id } = await createAuditLog({
      clientId: invoice.clientId,
      entityType: "Invoice",
      entityId: invoice._id,
      action: "CREATE",
      oldData: null,
      newData: invoice.toObject(),
      userId: authUser._id,
    });

    // 12. LINK INVOICE TO CUSTOMER
    findCustomer.invoices.push(invoice._id);
    findCustomer.history.push(_id);

    await findCustomer.save();

    return NextResponse.json(
      {
        success: true,
        message: "Invoice created successfully!",
        data: invoice,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE INVOICE API ERROR:", error);

    // MongoDB duplicate key protection
    if (error.code === 11000 && error.keyPattern?.invoiceNo) {
      return NextResponse.json(
        {
          success: false,
          message: "Invoice number already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invoice error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}