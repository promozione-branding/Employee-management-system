// app/api/customer/[id]/route.js


import { connectDB } from "@/lib/db";
import Customer from "@/models/admin/Customer";
import SalesEmployee from "@/models/employee/sales/SalesEmployee";
import Employee from "@/models/employee/Employee";
import { createAuditLog } from "@/utils/createAuditLog";
import { getAuthUser } from "@/lib/getAuthUser";
import { recordEdit, diffObjects } from "@/lib/auditLog";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

const OPTIONAL_TEXT_FIELDS = [
  "company",
  "GSTIN",
  "tanNo",
  "email",
  "website",
  "Address",
  "city",
  "state",
  "pincode",
  "country",
];

const isValidId = (id) =>
  typeof id === "string" &&
  mongoose.Types.ObjectId.isValid(id);

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const customer = await Customer.findById(id).populate({
      path: "salesExecutive",
      select: "basicDetails.name",
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: customer },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get customer by ID error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    const oldData = customer.toObject();

    await customer.deleteOne();

    // Remove the client from its sales employee assignments.
    const assignedEmployeeIds = (customer.salesExecutive || []).map(
      (employeeId) => employeeId.toString()
    );

    for (const employeeId of assignedEmployeeIds) {
      await SalesEmployee.updateOne(
        { employeeId },
        { $pull: { client: customer._id } }
      );
    }

    await createAuditLog({
      entityType: "Customer",
      entityId: customer._id,
      action: "DELETE",
      oldData,
      userId: authUser._id,
    });

    // ── NEW: mirror to unified EditHistory ──
    try {
      await recordEdit({
        clientId: customer._id,
        module: "customer",
        entityId: customer._id,
        action: "DELETE",
        summary: `Deleted customer "${customer.name}"`,
        actor: { userId: authUser._id },
        isConfidential: false,
        beforeSnapshot: oldData,
        req,
      });
    } catch (auditErr) {
      console.error("[edit-history] failed to record customer delete:", auditErr);
    }
    // ── END ──

    return NextResponse.json(
      {
        success: true,
        message: `${customer.name} customer deleted successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete customer error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer does not exist",
        },
        { status: 404 }
      );
    }

    const oldData = customer.toObject();

    const oldEmployeeIds = (customer.salesExecutive || []).map(
      (employeeId) => employeeId.toString()
    );

    // Validate GSTIN only when a non-empty value is provided.
    // An empty GSTIN is ignored to preserve existing customer data.
    if (Object.prototype.hasOwnProperty.call(body, "GSTIN")) {
      if (
        body.GSTIN !== null &&
        body.GSTIN !== undefined &&
        typeof body.GSTIN !== "string"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "GSTIN must be a string",
          },
          { status: 400 }
        );
      }

      const gstin = body.GSTIN?.trim().toUpperCase();

      if (gstin && !/^[0-9A-Z]{15}$/.test(gstin)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "GSTIN must contain exactly 15 alphanumeric characters.",
            errors: [
              {
                field: "GSTIN",
                message: "Please enter a valid 15-character GSTIN.",
              },
            ],
          },
          { status: 400 }
        );
      }

      if (!gstin) {
        delete body.GSTIN;
      } else {
        body.GSTIN = gstin;
      }
    }

    // Keep the existing assignment if the form sends an empty array.
    let newEmployeeIds = oldEmployeeIds;

    if (
      Object.prototype.hasOwnProperty.call(body, "salesExecutive")
    ) {
      const rawIds = Array.isArray(body.salesExecutive)
        ? body.salesExecutive
        : body.salesExecutive
          ? [body.salesExecutive]
          : [];

      const ids = [
        ...new Set(
          rawIds
            .filter(
              (employeeId) =>
                typeof employeeId === "string" &&
                employeeId.trim() !== ""
            )
            .map((employeeId) => employeeId.trim())
        ),
      ];

      if (ids.some((employeeId) => !isValidId(employeeId))) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid sales employee ID",
          },
          { status: 400 }
        );
      }

      // Empty selection means "keep the existing assignment".
      if (ids.length > 0) {
        for (const employeeId of ids) {
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
        }

        newEmployeeIds = ids;
        body.salesExecutive = ids;
      } else {
        delete body.salesExecutive;
      }
    }

    // Only update fields that belong to the Customer schema.
    // Never allow the request to overwrite internal history or IDs.
    const protectedFields = new Set([
      "_id",
      "__v",
      "createdAt",
      "updatedAt",
      "history",
    ]);

    for (const key of Object.keys(body)) {
      if (protectedFields.has(key) || !Customer.schema.path(key)) {
        continue;
      }

      let value = body[key];

      // Preserve saved values when optional text fields are blank.
      if (OPTIONAL_TEXT_FIELDS.includes(key)) {
        if (typeof value === "string") {
          value = value.trim();

          if (!value) {
            continue;
          }

          if (key === "email") {
            value = value.toLowerCase();
          }

          if (key === "GSTIN") {
            value = value.toUpperCase();
          }
        } else if (value == null) {
          continue;
        }
      }

      if (key === "name") {
        if (typeof value !== "string" || !value.trim()) {
          continue;
        }

        value = value.trim();
      }

      if (key === "phone") {
        const phone = String(value ?? "").trim();

        if (!phone || !Number.isFinite(Number(phone))) {
          return NextResponse.json(
            {
              success: false,
              message: "Please enter a valid client phone number",
            },
            { status: 400 }
          );
        }

        value = Number(phone);
      }

      if (key === "isPaid" && value === "") {
        value = false;
      }

      customer.set(key, value);
    }

    // Save the customer first.
    const editedCustomer = await customer.save();

    // Synchronize the SalesEmployee client lists if the assignment changed.
    const assignmentsChanged =
      oldEmployeeIds.length !== newEmployeeIds.length ||
      oldEmployeeIds.some(
        (employeeId) => !newEmployeeIds.includes(employeeId)
      );

    if (assignmentsChanged) {
      const removedEmployeeIds = oldEmployeeIds.filter(
        (employeeId) => !newEmployeeIds.includes(employeeId)
      );

      for (const employeeId of removedEmployeeIds) {
        await SalesEmployee.updateOne(
          { employeeId },
          { $pull: { client: editedCustomer._id } }
        );
      }

      for (const employeeId of newEmployeeIds) {
        let salesEmployee = await SalesEmployee.findOne({
          employeeId,
        });

        if (!salesEmployee) {
          salesEmployee = await SalesEmployee.create({
            employeeId,
            client: [editedCustomer._id],
          });

          const employee = await Employee.findById(employeeId);

          if (employee) {
            employee.salesDetails = salesEmployee._id;
            await employee.save();
          }
        } else {
          const alreadyAssigned = (salesEmployee.client || []).some(
            (clientId) =>
              clientId.toString() === editedCustomer._id.toString()
          );

          if (!alreadyAssigned) {
            salesEmployee.client.push(editedCustomer._id);
            await salesEmployee.save();
          }
        }
      }
    }

    // Create the audit log after a successful customer save.
    const auditLog = await createAuditLog({
      clientId: id,
      entityType: "Customer",
      entityId: editedCustomer._id,
      action: "UPDATE",
      oldData,
      newData: editedCustomer.toObject(),
      userId: authUser._id,
    });

    if (auditLog?._id) {
      editedCustomer.history.push(auditLog._id);
      await editedCustomer.save();
    }

    // ── NEW: mirror to unified EditHistory ──
    try {
      const changes = diffObjects(oldData, editedCustomer.toObject());
      if (changes.length > 0) {
        await recordEdit({
          clientId: editedCustomer._id,
          module: "customer",
          entityId: editedCustomer._id,
          action: "UPDATE",
          summary: `Updated customer profile (${changes.length} field${changes.length === 1 ? "" : "s"} changed)`,
          changes,
          actor: { userId: authUser._id },
          isConfidential: false,
          beforeSnapshot: oldData,
          afterSnapshot: editedCustomer.toObject(),
          req,
        });
      }
    } catch (auditErr) {
      console.error("[edit-history] failed to record customer update:", auditErr);
    }
    // ── END ──

    return NextResponse.json(
      {
        success: true,
        message: "Customer updated successfully",
        data: editedCustomer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Edit customer by ID error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer validation failed",
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
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
