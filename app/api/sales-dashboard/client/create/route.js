import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { validateClient } from "@/lib/validation/sales/client";
import { NextResponse } from "next/server";
import SalesEmployee from "@/models/employee/sales/SalesEmployee";
import Employee from "@/models/employee/Employee";
import { createAuditLog } from "@/utils/createAuditLog";
import { getAuthUser } from "@/lib/getAuthUser";

export async function POST(req) {
  try {
    await connectDB();

    // 🔐 AUTH USER (who created client)
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // ✅ Joi validation
    const { error, value } = validateClient(body);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.details.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // 🆕 CREATE CLIENT
    const client = await Customer.create(value);

    // 👨‍💼 Attach client to SalesEmployee
    if (client.salesExecutive) {
      let salesEmployee = await SalesEmployee.findOne({
        employeeId: client.salesExecutive,
      });

      // create salesEmployee if not exists
      if (!salesEmployee) {
        salesEmployee = await SalesEmployee.create({
          employeeId: client.salesExecutive,
          client: [client._id],
        });

        const employee = await Employee.findById(
          client.salesExecutive
        );

        if (!employee) {
          return NextResponse.json(
            {
              success: false,
              message: "Employee not found",
            },
            { status: 404 }
          );
        }

        employee.salesDetails = salesEmployee._id;
        await employee.save();
      } else {
        salesEmployee.client.push(client._id);
        await salesEmployee.save();
      }
    }

    // 🧾 CREATE AUDIT HISTORY
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

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
