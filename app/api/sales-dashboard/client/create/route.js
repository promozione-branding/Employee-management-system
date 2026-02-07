import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import { validateClient } from "@/lib/validation/sales/client";
import { NextResponse } from "next/server";
import SalesEmployee from "@/models/employee/sales/SalesEmployee";
import Employee from "@/models/employee/Employee";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    // Joi validation
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
        { status: 400 },
      );
    }

    // Create client
    const client = await Customer.create(value);

    // If salesExecutive is provided
    if (client.salesExecutive) {
      let salesEmployee = await SalesEmployee.findOne({
        employeeId: client.salesExecutive,
      });

      // If sales employee does not exist → create
      if (!salesEmployee) {
        salesEmployee = await SalesEmployee.create({
          employeeId: client.salesExecutive,
          client: [client._id],
        });

        const employee = await Employee.findById(client.salesExecutive);

        if (!employee) {
          return NextResponse.json(
            {
              success: false,
              message: "Employee not found",
            },
            { status: 404 },
          );
        }

        employee.salesDetails = salesEmployee._id;
        await employee.save();
      } else {
        // If exists → push client
        salesEmployee.client.push(client._id);
        await salesEmployee.save();
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Client created successfully",
        data: client,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create client error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
