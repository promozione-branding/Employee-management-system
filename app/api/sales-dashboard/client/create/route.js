
import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { NextResponse } from "next/server";
import SalesEmployee from "@/models/employee/sales/SalesEmployee";
import Employee from "@/models/employee/Employee";
import { createAuditLog } from "@/utils/createAuditLog";
import { getAuthUser } from "@/lib/getAuthUser";
import mongoose from "mongoose";

const optionalText = (value) => {
  if (typeof value !== "string") return undefined;
  return value.trim() || undefined;
};

export async function POST(req) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Only name and phone are required
    if (
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter client name",
        },
        { status: 400 }
      );
    }

    const phone = String(body.phone ?? "").trim();

    if (!phone || !Number.isFinite(Number(phone))) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid client phone number",
        },
        { status: 400 }
      );
    }

    // Validate GSTIN only when a value is provided
    const GSTIN = optionalText(body.GSTIN)?.toUpperCase();

    if (GSTIN && !/^[0-9A-Z]{15}$/.test(GSTIN)) {
      return NextResponse.json(
        {
          success: false,
          message: "GSTIN must contain exactly 15 alphanumeric characters",
          errors: [
            {
              field: "GSTIN",
              message: "Please enter a valid 15-character GSTIN",
            },
          ],
        },
        { status: 400 }
      );
    }

    // Normalize salesExecutive into an array of valid ObjectId strings
    const rawSalesExecutive = Array.isArray(body.salesExecutive)
      ? body.salesExecutive
      : body.salesExecutive
        ? [body.salesExecutive]
        : [];

    const salesExecutive = rawSalesExecutive
      .filter(
        (value) =>
          typeof value === "string" && value.trim() !== ""
      )
      .map((value) => value.trim());

    for (const employeeId of salesExecutive) {
      if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid sales employee ID",
          },
          { status: 400 }
        );
      }
    }

    // Validate employee IDs before creating the client
    const employees = [];

    for (const employeeId of salesExecutive) {
      const employee = await Employee.findById(employeeId);

      if (!employee) {
        return NextResponse.json(
          {
            success: false,
            message: "Sales employee not found",
          },
          { status: 404 }
        );
      }

      employees.push(employee);
    }

    // Normalize isPaid safely
    let isPaid = false;

    if (
      body.isPaid === true ||
      body.isPaid === "true" ||
      body.isPaid === 1 ||
      body.isPaid === "1"
    ) {
      isPaid = true;
    } else if (
      body.isPaid === false ||
      body.isPaid === "false" ||
      body.isPaid === 0 ||
      body.isPaid === "0" ||
      body.isPaid === "" ||
      body.isPaid == null
    ) {
      isPaid = false;
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid isPaid value",
        },
        { status: 400 }
      );
    }

    // Prepare the client document
    const clientData = {
      ...body,

      name: body.name.trim(),
      phone: Number(phone),

      company: optionalText(body.company),
      GSTIN,
      tanNo: optionalText(body.tanNo),
      email: optionalText(body.email)?.toLowerCase(),
      website: optionalText(body.website),
      Address: optionalText(body.Address),
      city: optionalText(body.city),
      state: optionalText(body.state),
      pincode: optionalText(body.pincode),
      country: optionalText(body.country),

      salesExecutive,
      isPaid,
    };

    // Create client
    const client = await Customer.create(clientData);

    // Attach the client to each selected sales employee
    for (const employee of employees) {
      let salesEmployee = await SalesEmployee.findOne({
        employeeId: employee._id,
      });

      if (!salesEmployee) {
        salesEmployee = await SalesEmployee.create({
          employeeId: employee._id,
          client: [client._id],
        });

        employee.salesDetails = salesEmployee._id;
        await employee.save();
      } else {
        const alreadyAssigned = (salesEmployee.client || []).some(
          (clientId) =>
            clientId.toString() === client._id.toString()
        );

        if (!alreadyAssigned) {
          salesEmployee.client.push(client._id);
          await salesEmployee.save();
        }
      }
    }

    // Create audit history
    await createAuditLog({
      entityType: "Customer",
      entityId: client._id,
      action: "CREATE",
      oldData: null,
      newData: client.toObject(),
      userId: authUser._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Client created successfully",
        data: client,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create client error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Client validation failed",
          errors:
            error.name === "ValidationError"
              ? Object.values(error.errors).map((err) => ({
                  field: err.path,
                  message: err.message,
                }))
              : [
                  {
                    field: error.path || "unknown",
                    message: error.message,
                  },
                ],
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
