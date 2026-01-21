import { connectDB } from "@/lib/db";
import Employee from "@/models/employee/Employee";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const employeeId = await Employee.findById(id).select("basicDetails employeeId");

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: "employee not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Employee detail fetched",
        data: employeeId,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    // only allow basic details

    const allowedFields = [
      "profileImage",
      "name",
      "designation",
      "phone",
      "address",
      "email",
      "dob",
      "gender",
      "joiningDate",
    ];

    const updateData = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[`basicDetails.${key}`] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid fields provided for update",
        },
        { status: 400 },
      );
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("basicDetails");

    if (!updatedEmployee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Basic details updated successfully",
        data: updatedEmployee,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      { status: 500 },
    );
  }
}
